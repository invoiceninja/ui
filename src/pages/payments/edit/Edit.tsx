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
import { InputField, SelectField, Textarea } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import paymentType from 'common/constants/payment-type';
import { endpoint } from 'common/helpers';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import { usePaymentQuery } from 'common/queries/payments';
import { useStaticsQuery } from 'common/queries/statics';
import { Container } from 'components/Container';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import Select from 'react-select';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: payment } = usePaymentQuery({ id });
  const [convertedCurrency, setconvertedCurrency] = useState(1);
  const [exchangeRate, setexchangeRate] = useState(1.0);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<ValidationBag>();
  const [changeCurrency, setchangeCurrency] = useState(false);
  const { data: statistic } = useStaticsQuery();
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      number: payment?.data.data.number || '',
      amount: payment?.data.data.amount || 0,
      date: payment?.data.data.date || '',
      type_id: payment?.data.data.type_id || '',
      transaction_reference: payment?.data.data.transaction_reference || '',
      private_notes: payment?.data.data.private_notes || '',
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      axios
        .put(endpoint('/api/v1/payments/:id', { id }), values, {
          headers: defaultHeaders,
        })
        .then(() => {
          toast.success(t('updated_payment'), { id: toastId });
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
            generatePath('/api/v1/payments/:id', { id })
          );
        });
    },
  });
  const options: any[] = [];

  statistic?.data.currencies.forEach((element: any) => {
    options.push({
      value: element.id,
      label: element.name,
      exchangeRate: element.exchange_rate,
    });
  });

  return (
    <Default>
      <Container>
        <Card
          title={t('edit_payment')}
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          withSaveButton
        >
          <div className="bg-white p-6 w-full rounded shadow my-3">
            <Element leftSide={t('payment_number')}>
              <InputField
                id="number"
                value={formik.values.number}
                onChange={formik.handleChange}
                errorMessage={errors?.errors.payment_amount}
              ></InputField>
            </Element>
            <Element leftSide={t('payment_date')}>
              <InputField
                id="date"
                type="date"
                value={formik.values.date}
                onChange={formik.handleChange}
              ></InputField>
            </Element>
            <Element leftSide={t('payment_type')}>
              <SelectField id="type_id" onChange={formik.handleChange}>
                {Object.entries(paymentType).map((value: any, index: any) => {
                  if (value[0] === formik.values.type_id) {
                    return (
                      <option value={String(value[0])} selected>
                        {t(value[1])}
                      </option>
                    );
                  } else
                    return (
                      <option key={index} value={String(value[0])}>
                        {t(value[1])}
                      </option>
                    );
                })}
              </SelectField>
            </Element>
            <Element leftSide={t('transaction_reference')}>
              <InputField
                id="transaction_reference"
                onChange={formik.handleChange}
                value={formik.values.transaction_reference}
              ></InputField>
            </Element>
            <Element leftSide={t('private_notes')}>
              <Textarea
                id="private_notes"
                value={formik.values.private_notes}
                onChange={formik.handleChange}
              ></Textarea>
            </Element>
            <Element leftSide="Change currency">
              <Toggle
                value={changeCurrency}
                onChange={() => {
                  setchangeCurrency(!changeCurrency);
                }}
              />
            </Element>
          </div>
          {changeCurrency && (
            <div className="bg-white p-6 w-full rounded shadow my-3 z-30">
              <Element leftSide={t('currency')}>
                <Select
                  onChange={(option: any) => {
                    setconvertedCurrency(
                      option.exchangeRate * formik.values.amount
                    );
                    setexchangeRate(option.exchangeRate);
                  }}
                  placeholder={t('status')}
                  options={options}
                />
              </Element>
              <Element leftSide={t('exchange_rate')}>
                <InputField value={exchangeRate}></InputField>
              </Element>
              {console.log(statistic?.data.currencies)}
              <Element leftSide={t('converted_amount')}>
                <InputField value={convertedCurrency}></InputField>
              </Element>
            </div>
          )}
        </Card>
      </Container>
    </Default>
  );
}
