/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { usePaymentQuery } from '$app/common/queries/payments';
import { Divider } from '$app/components/cards/Divider';
import Toggle from '$app/components/forms/Toggle';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCompanyGatewayQuery } from '$app/common/queries/company-gateways';
import { Gateway } from '$app/common/interfaces/statics';
import { toast } from '$app/common/helpers/toast/toast';
import collect from 'collect.js';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { $refetch } from '$app/common/hooks/useRefetch';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { useColorScheme } from '$app/common/colors';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import { ErrorMessage } from '$app/components/ErrorMessage';

export default function Refund() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();
  const { data: payment } = usePaymentQuery({ id });

  const formatMoney = useFormatMoney();

  const { data: companyGateway } = useCompanyGatewayQuery({
    id: payment?.company_gateway_id,
    queryParams: 'include=gateway',
    enabled: Boolean(payment?.company_gateway_id),
  });

  const [errors, setErrors] = useState<ValidationBag>();
  const [invoices, setInvoices] = useState<string[]>([]);
  const [email, setEmail] = useState(false);
  const [shouldShowGatewayRefund, setShouldShowGatewayRefund] =
    useState<boolean>(false);
  const [refundGateway, setRefundGateway] = useState<boolean>(false);

  const navigate = useNavigate();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: payment?.id,
      date: payment?.date,

      invoices: [],
    },
    onSubmit: (values) => {
      toast.processing();
      setErrors(undefined);

      let endPointUrl = '/api/v1/payments/refund?&email_receipt=:email';

      if (refundGateway) {
        endPointUrl += '&gateway_refund=true';
      }

      request('POST', endpoint(endPointUrl, { email }), values)
        .then(() => {
          toast.success('refunded_payment');
          navigate('/payments');
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => {
          formik.setSubmitting(false);

          $refetch(['payments']);
        });
    },
  });

  const getInvoiceAmount = (invoiceItem: Invoice) => {
    const paymentable = payment?.paymentables.find(
      ({ invoice_id }) => invoice_id === invoiceItem.id
    );

    return paymentable ? paymentable.amount - paymentable.refunded : 0;
  };

  const getInvoiceLabel = (invoice: Invoice) => {
    const paymentable = payment?.paymentables.find(
      ({ invoice_id }) => invoice_id === invoice.id
    );

    return paymentable
      ? `${t('invoice')} #${invoice.number} - ${t('refundable')} (${formatMoney(
          paymentable.amount - paymentable.refunded,
          payment?.client?.country_id,
          payment?.client?.settings.currency_id
        )})`
      : '';
  };

  useEffect(() => {
    if (payment && Array.isArray(payment.invoices)) {
      invoices.map((invoiceId: string) => {
        const invoiceItem = payment.invoices!.find(
          (invoice: Invoice) => invoice.id == invoiceId
        );

        if (invoiceItem)
          formik.setFieldValue('invoices', [
            ...formik.values.invoices,
            {
              amount: getInvoiceAmount(invoiceItem),
              invoice_id: invoiceItem?.id,
              id: '',
            },
          ]);
      });
    }
  }, [invoices]);

  useEffect(() => {
    let total = 0;
    formik.values.invoices.map((invoice: any) => {
      total = total + Number(invoice.amount);
      setInvoices(
        invoices.filter((invoiceId: string) => invoiceId != invoice.invoice_id)
      );
    });
  }, [formik.values.invoices]);

  useEffect(() => {
    if (companyGateway) {
      const gateway: Gateway = companyGateway.data.data.gateway;

      const showGatewayRefund = Object.values(gateway.options).some(
        (option) => option.refund
      );

      setShouldShowGatewayRefund(showGatewayRefund);
    }
  }, [companyGateway]);

  const refundableInvoices = () => {
    const $invoices = collect(formik?.values.invoices).pluck('invoice_id');

    return payment?.invoices?.filter(
      (invoice: Invoice) => !$invoices.contains(invoice.id)
    );
  };

  useSaveBtn(
    {
      onClick: () => formik.handleSubmit(),
      disableSaveButton: formik.isSubmitting || !formik.values.invoices.length,
    },
    [formik.values, formik.isSubmitting]
  );

  return (
    <Card
      title={t('refund_payment')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <Element leftSide={t('number')}>
        <InputField disabled value={payment?.number} />
      </Element>

      {payment && (
        <Element leftSide={t('amount')}>
          <InputField disabled value={payment?.amount - payment?.refunded} />
        </Element>
      )}

      <Element leftSide={t('applied')}>
        <InputField disabled value={payment?.applied} />
      </Element>

      <Element leftSide={t('date')}>
        <InputField
          type="date"
          value={formik.values.date}
          onValueChange={(value) => formik.setFieldValue('date', value)}
        />
      </Element>

      <Element leftSide={t('invoices')}>
        <SelectField
          onValueChange={(value) => {
            if (
              formik.values.invoices.filter(
                (invoice: { invoice_id: string }) => invoice.invoice_id == value
              ).length < 1
            ) {
              setInvoices([...invoices, value]);
            }
          }}
          withBlank
          customSelector
          clearAfterSelection
        >
          {refundableInvoices()?.map((invoice: Invoice, index: number) => (
            <option key={index} value={invoice.id}>
              {getInvoiceLabel(invoice)}
            </option>
          ))}
        </SelectField>

        {errors?.errors.invoices && (
          <div className="py-2">
            <ErrorMessage>{errors.errors.invoices}</ErrorMessage>
          </div>
        )}
      </Element>

      <Divider />

      {payment &&
        Array.isArray(payment.invoices) &&
        formik.values.invoices.map(
          (requestInvoiceItem: { invoice_id: string }, index: number) => {
            const invoiceItem = payment.invoices!.find(
              (invoice: Invoice) => invoice.id == requestInvoiceItem.invoice_id
            );

            if (invoiceItem)
              return (
                <div key={index} className="flex flex-col">
                  <Element leftSide={`${t('invoice')}: ${invoiceItem?.number}`}>
                    <div className="flex items-center space-x-2">
                      <NumberInputField
                        value={
                          (formik.values.invoices[index] as Invoice).amount ||
                          ''
                        }
                        onValueChange={(value) =>
                          formik.setFieldValue(
                            `invoices.${index}.amount`,
                            parseFloat(value)
                          )
                        }
                      />

                      <div
                        className="cursor-pointer focus:outline-none focus:ring-0"
                        onClick={() => {
                          formik.setFieldValue(
                            'invoices',
                            formik.values.invoices.filter(
                              (invoice: any) =>
                                invoice.invoice_id !=
                                requestInvoiceItem.invoice_id
                            )
                          );
                        }}
                      >
                        <CircleXMark
                          color={colors.$16}
                          hoverColor={colors.$3}
                          borderColor={colors.$5}
                          hoverBorderColor={colors.$17}
                          size="1.6rem"
                        />
                      </div>
                    </div>
                  </Element>

                  {(errors?.errors[`invoices.${[index]}.invoice_id`] ||
                    errors?.errors[`invoices.${[index]}.amount`]) && (
                    <div className="px-6">
                      <ErrorMessage className="mt-2 break-all">
                        {errors?.errors[`invoices.${[index]}.invoice_id`] ||
                          errors?.errors[`invoices.${[index]}.amount`]}
                      </ErrorMessage>
                    </div>
                  )}
                </div>
              );
          }
        )}

      {Boolean(
        payment &&
          Array.isArray(payment.invoices) &&
          formik.values.invoices.length
      ) && <Divider className="pt-4" withoutPadding />}

      <Element leftSide={t('send_email')} leftSideHelp={t('email_receipt')}>
        <Toggle
          checked={email}
          onChange={() => {
            setEmail(!email);
          }}
        />
      </Element>

      {shouldShowGatewayRefund && (
        <Element
          leftSide={t('gateway_refund')}
          leftSideHelp={t('gateway_refund_help')}
        >
          <Toggle
            checked={refundGateway}
            onChange={(value) => setRefundGateway(value)}
          />
        </Element>
      )}

      {errors?.errors.id && <ErrorMessage>{errors.errors.id}</ErrorMessage>}
    </Card>
  );
}
