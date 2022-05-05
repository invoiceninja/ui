/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button, InputField, SelectField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import collect from 'collect.js';
import paymentType from 'common/constants/payment-type';
import { endpoint } from 'common/helpers';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Client } from 'common/interfaces/client';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useClientsQuery } from 'common/queries/clients';
import { defaultHeaders } from 'common/queries/common/headers';
import { useBlankPaymentQuery } from 'common/queries/payments';
import { Alert } from 'components/Alert';
import { Divider } from 'components/cards/Divider';
import { Container } from 'components/Container';
import { ConvertCurrency } from 'components/ConvertCurrency';
import { CustomField } from 'components/CustomField';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useFormik } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { X } from 'react-feather';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { v4 } from 'uuid';

export function Create() {
  const [t] = useTranslation();

  const { client_id } = useParams();
  const { data: payment } = useBlankPaymentQuery();
  const { data: clients } = useClientsQuery();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const company = useCurrentCompany();

  const [errors, setErrors] = useState<ValidationBag>();
  const [convertCurrency, setConvertCurrency] = useState(false);
  const [emailInvoice, setEmailInvoice] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      amount: 0,
      client_id: client_id || '',
      date: payment?.data.data.date,
      transaction_reference: '',
      type_id: company?.settings?.payment_type_id,
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
            headers: defaultHeaders(),
          }
        )
        .then((data) => {
          toast.success(t('created_payment'), { id: toastId });
          navigate(generatePath('/payments/:id/edit', { id: data.data.data.id }));
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

  useEffect(() => {
    formik.setFieldValue('invoices', []);
  }, [formik.values.client_id]);

  useEffect(() => {
    formik.setFieldValue(
      'amount',
      collect(formik.values.invoices).sum('amount')
    );
  }, [formik.values.invoices]);

  const handleClientChange = (clientId: string, currencyId: string) => {
    formik.setFieldValue('client_id', clientId);
    formik.setFieldValue('currency_id', currencyId);
  };

  const handleInvoiceChange = (id: string, amount: number, balance: number) => {
    formik.setFieldValue('invoices', [
      ...formik.values.invoices,
      {
        _id: v4(),
        amount: balance > 0 ? balance : amount,
        credit_id: '',
        invoice_id: id,
      },
    ]);

  };

  const handleRemovingInvoice = (id: string) => {
    formik.setFieldValue(
      'invoices',
      formik.values.invoices.filter(
        (record: { _id: string }) => record._id !== id
      )
    );
  };

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
            <DebouncedCombobox
              endpoint="/api/v1/clients"
              label="name"
              onChange={(value: Record<Client>) =>
                handleClientChange(
                  value.resource?.id as string,
                  value.resource?.settings.currency_id
                )
              }
              defaultValue={formik.values.client_id}
            />
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

          {formik.values.client_id && <Divider />}

          {formik.values.client_id && (
            <>
              {formik.values.invoices.map(
                (record: { _id: string; amount: number }, index) => (
                  <Element
                    key={index}
                    leftSide={
                      <DebouncedCombobox
                        inputLabel={t('invoice')}
                        endpoint={generatePath(
                          '/api/v1/invoices?payable=:clientId',
                          { clientId: formik.values.client_id }
                        )}
                        label="number"
                        onChange={(value: Record<Invoice>) =>
                          handleInvoiceChange(
                            value.resource?.id as string,
                            value.resource?.amount as number,
                            value.resource?.balance as number
                          )
                        }
                        value="amount"
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        defaultValue={formik.values.invoices[index].amount}
                      />
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <InputField
                        label={t('amount')}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          formik.setFieldValue('amount', event.target.value);

                          formik.setFieldValue(
                            `invoices[${index}].amount`,
                            event.target.value
                          );
                        }}
                        value={record.amount}
                      />

                      <Button
                        behavior="button"
                        type="minimal"
                        onClick={() => handleRemovingInvoice(record._id)}
                      >
                        <X />
                      </Button>
                    </div>
                  </Element>
                )
              )}

              <Element leftSide={t('invoices')}>
                <DebouncedCombobox
                  endpoint={generatePath('/api/v1/invoices?payable=:clientId&per_page=10000', {
                    clientId: formik.values.client_id,
                  })}
                  label="number"
                  onChange={(value: Record<Invoice>) =>
                    handleInvoiceChange(
                      value.resource?.id as string,
                      value.resource?.amount as number,
                      value.resource?.balance as number
                    )
                  }
                />
              </Element>
            </>
          )}

          {formik.values.client_id && <Divider />}

          <Element leftSide={t('payment_date')}>
            <InputField
              type="date"
              id="date"
              value={formik.values.date}
              onChange={formik.handleChange}
            />
          </Element>

          <Element leftSide={t('payment_type')}>
            <SelectField
              id="type_id"
              defaultValue={formik.values.type_id}
              onChange={formik.handleChange}
            >
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
                setEmailInvoice(!emailInvoice);
              }}
            />
          </Element>

          <Element leftSide={t('convert_currency')}>
            <Toggle
              checked={formik.values.exchange_currency_id}
              onChange={() => {
                setConvertCurrency(!convertCurrency);
                formik.setFieldValue('exchange_currency_id', '');
                formik.setFieldValue('exchange_rate', 1);
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
