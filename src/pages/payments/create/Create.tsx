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
import { InputField, SelectField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import paymentType from 'common/constants/payment-type';
import { endpoint } from 'common/helpers';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Client } from 'common/interfaces/client';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useClientsQuery } from 'common/queries/clients';
import { defaultHeaders } from 'common/queries/common/headers';
import { useBlankPaymentQuery } from 'common/queries/payments';
import { useStaticsQuery } from 'common/queries/statics';
import { Alert } from 'components/Alert';
import { Container } from 'components/Container';
import { CustomField } from 'components/CustomField';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

export function Create() {
  const { client_id } = useParams();
  const [t] = useTranslation();
  const { data: payment } = useBlankPaymentQuery();
  const { data: clients } = useClientsQuery();
  const { data: statics } = useStaticsQuery();
  const [errors, setErrors] = useState<ValidationBag>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const company=useCurrentCompany();
  const [convertCurrency, setconvertCurrency] = useState(false);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      amount: 0,
      client_id: client_id || '',
      date: payment?.data.data.date,
      transaction_reference: '',
      type_id: '',
      private_notes: '',
      exchange_rate: 0,
      exchange_currency_id: payment?.data.data.exchange_currency_id || 0,
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      axios
        .post(endpoint('/api/v1/payments'), values, {
          headers: defaultHeaders,
        })
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

  const getExchangeRate = (fromCurrencyId: string, toCurrencyId: string) => {
    if (fromCurrencyId == null || toCurrencyId == null) {
      return 1;
    }
    const fromCurrency = statics?.data.currencies.find(
      (data: any) => data.id === fromCurrencyId
    );
    const toCurrency = statics?.data.currencies.find(
      (data: any) => data.id === toCurrencyId
    );
    const baseCurrency = statics?.data.currencies.find(
      (data: any) => data.id === '1'
    );

    if (fromCurrency == baseCurrency) {
      return toCurrency.exchange_rate;
    }

    if (toCurrency == baseCurrency) {
      return 1 / (fromCurrency?.exchange_rate ?? 1);
    }

    return toCurrency.exchange_rate * (1 / fromCurrency.exchange_rate);
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
            <SelectField
              onChange={formik.handleChange}
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
              onChange={formik.handleChange}
              errorMessage={errors?.errors.payment_amount}
            />
          </Element>
          <Element leftSide={t('invoice')}>
            <InputField />
          </Element>
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
            <Toggle />
          </Element>
          <Element leftSide={t('convert_currency')}>
            <Toggle
              checked={formik.values.exchange_currency_id}
              onChange={() => {
                setconvertCurrency(!convertCurrency);
                formik.setFieldValue('exchange_currency_id', '');
                formik.setFieldValue('exchange_rate', '');
              }}
            />{' '}
          </Element>
          {convertCurrency && (
            <>
              <Element leftSide={t('currency')}>
                <SelectField
                  value={formik.values.exchange_currency_id}
                  onChange={(event: any) => {
                    formik.setFieldValue(
                      'exchange_rate',
                      getExchangeRate('1', event.target.value)
                    );
                    formik.setFieldValue(
                      'exchange_currency_id',
                      event.target.value
                    );
                  }}
                >
                  <option value=""></option>
                  {statics?.data.currencies.map((element: any, index: any) => {
                    return (
                      <option value={element.id} key={index}>
                        {element.name}
                      </option>
                    );
                  })}
                </SelectField>
              </Element>
              <Element leftSide={t('exchange_rate')}>
                <InputField
                  onChange={(event: any) => {
                    formik.setFieldValue('exchange_rate', event.target.valeu);
                  }}
                  value={formik.values.exchange_rate}
                />
              </Element>
              <Element leftSide={t('converted_amount')}>
                <InputField
                  value={formik.values.amount * formik.values.exchange_rate}
                />
              </Element>
            </>
          )}
        </Card>
      </Container>
    </Default>
  );
}
