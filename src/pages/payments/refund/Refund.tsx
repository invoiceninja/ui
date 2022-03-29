/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button, InputField, SelectField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import { usePaymentQuery } from 'common/queries/payments';
import { Alert } from 'components/Alert';
import { Divider } from 'components/cards/Divider';
import Toggle from 'components/forms/Toggle';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

export function Refund() {
  const { id } = useParams();
  const { data: payment } = usePaymentQuery({ id });

  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();
  const [invoices, setInvoices] = useState<string[]>([]);
  const [email, setEmail] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: payment?.data.data.id,
      date: payment?.data.data.date,

      invoices: [],
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      axios
        .post(
          endpoint('/api/v1/payments/refund?&email_receipt=:email', { email }),
          values,
          {
            headers: defaultHeaders,
          }
        )
        .then(() => {
          toast.success(t('refunded_payment'), { id: toastId });
          navigate('/payments');
        })
        .catch((error: AxiosError) => {
          console.error(error);
          toast.error(t('error_title'), { id: toastId });
          if (error.response?.status === 422) {
            setErrors(error.response.data);
          }
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries(
            generatePath('/api/v1/payments/refund?email_receipt=:email', {
              email: String(email),
            })
          );
        });
    },
  });

  const getInvoiceAmount = (invoiceItem: Invoice) =>
    invoiceItem?.paid_to_date >
    payment?.data.data.amount - payment?.data.data.refunded
      ? payment?.data.data.amount - payment?.data.data.refunded
      : invoiceItem?.paid_to_date;

  useEffect(() => {
    invoices.map((invoiceId: string) => {
      const invoiceItem = payment?.data.data.invoices.find(
        (invoice: Invoice) => invoice.id == invoiceId
      );
      if (invoiceItem)
        formik.setFieldValue('invoices', [
          ...formik.values.invoices,
          {
            amount: getInvoiceAmount(invoiceItem),
            invoice_id: invoiceItem?.id,
            credit_id: '',
            id: '',
          },
        ]);
    });
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

  return (
    <Card
      title={t('refund_payment')}
      disableSubmitButton={formik.isSubmitting}
      onFormSubmit={formik.handleSubmit}
      withSaveButton
      saveButtonLabel={t('refund')}
    >
      <Element leftSide={t('number')}>
        <InputField disabled value={payment?.data.data.number} />
      </Element>

      <Element leftSide={t('amount')}>
        <InputField
          disabled
          value={payment?.data.data.amount - payment?.data.data.refunded}
        />
      </Element>

      <Element leftSide={t('applied')}>
        <InputField disabled value={payment?.data.data.applied} />
      </Element>

      <Element leftSide={t('date')}>
        <InputField
          type="date"
          value={formik.values.date}
          onChange={formik.handleChange}
        />
      </Element>

      <Element leftSide={t('invoices')}>
        <SelectField
          onChange={(event: any) => {
            if (
              formik.values.invoices.filter(
                (invoice: { invoice_id: string }) =>
                  invoice.invoice_id == event.target.value
              ).length < 1
            )
              setInvoices([...invoices, event.target.value]);
          }}
        >
          <option value=""></option>
          {payment?.data.data.invoices &&
            payment?.data.data.invoices.map(
              (invoice: Invoice, index: number) => (
                <option key={index} value={invoice.id}>
                  {invoice.number}
                </option>
              )
            )}
        </SelectField>

        {errors?.errors.invoices && (
          <div className="py-2">
            <Alert type="danger">{errors.errors.invoices}</Alert>
          </div>
        )}
      </Element>

      <Divider />

      {payment?.data.data &&
        formik.values.invoices.map(
          (requestInvoiceItem: { invoice_id: string }, index: number) => {
            const invoiceItem = payment?.data.data.invoices.find(
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
                      value={
                        invoiceItem?.paid_to_date >
                        payment?.data.data.amount - payment?.data.data.refunded
                          ? payment?.data.data.amount -
                            payment?.data.data.refunded
                          : invoiceItem?.paid_to_date
                      }
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

      <Element leftSide={t('send_email')}>
        <Toggle
          checked={email}
          onChange={() => {
            setEmail(!email);
          }}
        />
      </Element>

      {errors?.errors.id && <Alert type="danger">{errors.errors.id}</Alert>}
    </Card>
  );
}
