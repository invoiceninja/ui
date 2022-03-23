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
import paymentType from 'common/constants/payment-type';
import { InvoiceStatus } from 'common/enums/invoice-status';
import { endpoint } from 'common/helpers';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Client } from 'common/interfaces/client';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useClientsQuery } from 'common/queries/clients';
import { defaultHeaders } from 'common/queries/common/headers';
import { useBlankPaymentQuery } from 'common/queries/payments';
import { Alert } from 'components/Alert';
import { Container } from 'components/Container';
import { ConvertCurrency } from 'components/ConvertCurrency';
import { CustomField } from 'components/CustomField';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { useAllInvoicesQuery } from '../common/helpers/invoices-query';
export function Create() {
  const { client_id } = useParams();
  const [t] = useTranslation();
  const { data: payment } = useBlankPaymentQuery();
  const { data: clients } = useClientsQuery();
  const [errors, setErrors] = useState<ValidationBag>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const company = useCurrentCompany();
  const [invoices, setinvoices] = useState<string[]>([]);
  const [invoicedata, setinvoicedata] = useState<Invoice[]>([]);
  const [convertCurrency, setconvertCurrency] = useState(false);
  const [emailInvoice, setemailInvoice] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      amount: 0,
      aplied: 0,
      client_id: client_id || '',
      date: payment?.data.data.date,
      transaction_reference: '',
      type_id: '',
      private_notes: '',
      currency_id: clients?.data.data.find(
        (client: any) => client.id == client_id
      )?.settings.currency_id,
      exchange_rate: 1,
      exchange_currency_id: payment?.data.data.exchange_currency_id,
      invoices: [],
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      axios
        .post(
          endpoint('/api/v1/payments?email_receipt=:email', {
            email: emailInvoice,
          }),
          values,
          {
            headers: defaultHeaders,
          }
        )
        .then((data) => {
          toast.success(t('added_payment'), { id: toastId });
          navigate(`/payments/${data.data.data.id}/edit`);
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
          queryClient.invalidateQueries(generatePath('/api/v1/payments'));
        });
    },
  });
  const allinvocies = useAllInvoicesQuery();

  useEffect(() => {
    const filteredInvoices = allinvocies.filter((invoice: Invoice) => {
      if (
        invoice.client_id == formik.values.client_id &&
        invoice.status_id != InvoiceStatus.Paid &&
        invoice.archived_at == 0
      ) {
        return invoice;
      }
    });

    setinvoicedata(filteredInvoices);
  }, [allinvocies, formik.values.client_id]);

  useEffect(() => {
    invoices.map((invoiceId: string) => {
      const invoiceItem = allinvocies.find(
        (invoice: Invoice) => invoice.id == invoiceId
      );
      if (invoiceItem)
        formik.setFieldValue('invoices', [
          ...formik.values.invoices,
          {
            amount:
              invoiceItem?.balance > 0
                ? invoiceItem?.balance
                : invoiceItem?.amount,
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
      setinvoices(
        invoices.filter((invoiceId: string) => invoiceId != invoice.invoice_id)
      );
    });

    formik.setFieldValue('aplied', total);
    formik.setFieldValue('amount', total);
  }, [formik.values.invoices]);

  useEffect(() => {
    formik.setFieldValue('invoices', []);
  }, [formik.values.client_id]);

  return (
    <Default title={t('new_payment')}>
      <Container>
        <Card
          title={t('new_payment')}
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          withSaveButton
        >
          <Element leftSide={t('client')}>
            <SelectField
              onChange={(event: any) => {
                const client: Client = clients?.data.data.find(
                  (client: any) => client.id == event.target.value
                );
                formik.setFieldValue('client_id', event.target.value);
                formik.setFieldValue(
                  'currency_id',
                  client.settings.currency_id
                );
              }}
              value={formik.values.client_id}
              id="client_id"
              required
            >
              <option value=""></option>
              {clients?.data.data.map((client: Client, index: number) => {
                return (
                  <option value={client.id} key={index}>
                    {client.display_name}
                  </option>
                );
              })}
            </SelectField>
            {errors?.errors.client_id && (
              <Alert type="danger">{errors.errors.client_id}</Alert>
            )}
          </Element>
          <Element leftSide={t('amount')}>
            <InputField
              id="amount"
              value={formik.values.amount}
              onChange={formik.handleChange}
              errorMessage={errors?.errors.payment_amount}
            />
          </Element>
          {formik.values.client_id && (
            <>
              <Element leftSide={t('invoices')}>
                <SelectField
                  value=""
                  onChange={(event: any) => {
                    if (
                      formik.values.invoices.filter(
                        (invoices: any) =>
                          invoices.invoice_id == event.target.value
                      ).length < 1
                    )
                      setinvoices([...invoices, event.target.value]);
                  }}
                >
                  <option value="" disabled></option>
                  {invoicedata.map((invoice: Invoice, index: number) => {
                    return (
                      <option key={index} value={invoice.id}>
                        {invoice.number}
                      </option>
                    );
                  })}
                </SelectField>
              </Element>
              {formik.values.invoices.map((invoiceitem: any, index: number) => {
                const invoiceItem = invoicedata.find(
                  (invoice: Invoice) => invoice.id == invoiceitem.invoice_id
                );

                if (invoiceItem)
                  return (
                    <Element key={index} leftSide={invoiceItem?.number}>
                      <InputField
                        id={`invoices[${index}].amount`}
                        value={
                          invoiceItem?.balance > 0
                            ? invoiceItem?.balance
                            : invoiceItem?.amount
                        }
                        onChange={formik.handleChange}
                      />
                      <Button
                        behavior="button"
                        type="minimal"
                        onClick={() => {
                          formik.setFieldValue(
                            'invoices',
                            formik.values.invoices.filter(
                              (invoice: any) =>
                                invoice.invoice_id != invoiceitem.invoice_id
                            )
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </Element>
                  );
              })}
            </>
          )}

          <Element leftSide={t('payment_date')}>
            <InputField
              type="date"
              id="date"
              value={formik.values.date}
              onChange={formik.handleChange}
            />
          </Element>
          <Element leftSide={t('payment_type')}>
            <SelectField id="type_id" onChange={formik.handleChange}>
              <option value=""></option>
              {Object.entries(paymentType).map(([id, type], index) => (
                <option value={id} key={index}>
                  {t(type)}
                </option>
              ))}
            </SelectField>
          </Element>
          <Element leftSide={t('transaction_reference')}>
            <InputField
              id="transaction_reference"
              onChange={formik.handleChange}
            />
          </Element>
          <Element leftSide={t('private_notes')}>
            <InputField
              element="textarea"
              id="private_notes"
              onChange={formik.handleChange}
            />
          </Element>
          {company?.custom_fields?.payment1 && (
            <CustomField
              field="payment1"
              defaultValue={payment?.data.data.custom_value1}
              value={company?.custom_fields?.payment1}
              onChange={(value) => formik.setFieldValue('custom_value1', value)}
            />
          )}
          {company?.custom_fields?.payment2 && (
            <CustomField
              field="custom_value2"
              defaultValue={payment?.data.data.custom_value2}
              value={company?.custom_fields?.payment2}
              onChange={(value) => formik.setFieldValue('custom_value2', value)}
            />
          )}

          {company?.custom_fields?.payment3 && (
            <CustomField
              field="custom_value3"
              defaultValue={payment?.data.data.custom_value3}
              value={company?.custom_fields?.payment3}
              onChange={(value) => formik.setFieldValue('custom_value3', value)}
            />
          )}

          {company?.custom_fields?.payment4 && (
            <CustomField
              field="custom_value4"
              defaultValue={payment?.data.data.custom_value4}
              value={company?.custom_fields?.payment4}
              onChange={(value) => formik.setFieldValue('custom_value4', value)}
            />
          )}
          <Element leftSide={t('send_email')}>
            <Toggle
              checked={emailInvoice}
              onChange={() => {
                setemailInvoice(!emailInvoice);
              }}
            />
          </Element>
          <Element leftSide={t('convert_currency')}>
            <Toggle
              checked={formik.values.exchange_currency_id}
              onChange={() => {
                setconvertCurrency(!convertCurrency);
                formik.setFieldValue('exchange_currency_id', '');
                formik.setFieldValue('exchange_rate', '');
              }}
            />
          </Element>
          {convertCurrency && (
            <ConvertCurrency
              setFieldValue={formik.setFieldValue}
              exchange_currency_id={formik.values.exchange_currency_id}
              currency_id={formik.values.currency_id}
              amount={formik.values.amount}
              exchange_rate={formik.values.exchange_rate}
            />
          )}
        </Card>
      </Container>
    </Default>
  );
}
