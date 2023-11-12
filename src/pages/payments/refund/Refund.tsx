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
import { Button, InputField, SelectField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { usePaymentQuery } from '$app/common/queries/payments';
import { Alert } from '$app/components/Alert';
import { Divider } from '$app/components/cards/Divider';
import Toggle from '$app/components/forms/Toggle';
import { useFormik } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCompanyGatewayQuery } from '$app/common/queries/company-gateways';
import { Gateway } from '$app/common/interfaces/statics';
import { toast } from '$app/common/helpers/toast/toast';
import collect from 'collect.js';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { $refetch } from '$app/common/hooks/useRefetch';

export default function Refund() {
  const { id } = useParams();
  const { data: payment } = usePaymentQuery({ id });

  const formatMoney = useFormatMoney();

  const { data: companyGateway } = useCompanyGatewayQuery({
    id: payment?.company_gateway_id,
    queryParams: 'include=gateway',
    enabled: Boolean(payment?.company_gateway_id),
  });

  const [t] = useTranslation();
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
    <Card title={t('refund_payment')}>
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
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            if (
              formik.values.invoices.filter(
                (invoice: { invoice_id: string }) =>
                  invoice.invoice_id == event.target.value
              ).length < 1
            )
              setInvoices([...invoices, event.target.value]);
            event.target.value = '';
          }}
          withBlank
        >
          {refundableInvoices()?.map((invoice: Invoice, index: number) => (
            <option key={index} value={invoice.id}>
              {getInvoiceLabel(invoice)}
            </option>
          ))}
        </SelectField>

        {errors?.errors.invoices && (
          <div className="py-2">
            <Alert type="danger">{errors.errors.invoices}</Alert>
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
                <Element
                  key={index}
                  leftSide={`${t('invoice')}: ${invoiceItem?.number}`}
                >
                  <div className="flex items-center space-x-2">
                    <InputField
                      id={`invoices[${index}].amount`}
                      type="number"
                      value={(formik.values.invoices[index] as Invoice).amount}
                      onChange={formik.handleChange}
                      errorMessage={
                        errors?.errors[`invoices.${[index]}.invoice_id`]
                      }
                    />

                    <Button
                      behavior="button"
                      type="minimal"
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
                      <X />
                    </Button>
                  </div>
                </Element>
              );
          }
        )}

      <Divider />

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

      {errors?.errors.id && <Alert type="danger">{errors.errors.id}</Alert>}
    </Card>
  );
}
