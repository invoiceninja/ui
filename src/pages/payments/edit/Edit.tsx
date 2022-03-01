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
import { InputField, Textarea } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import { usePaymentQuery } from 'common/queries/payments';
import { Container } from 'components/Container';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: payment } = usePaymentQuery({ id });
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<ValidationBag>();
  //for some reason formik doesnt update values
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      number: payment?.data.data.number || '',
      amount: payment?.data.data.amount || 0,
      date: payment?.data.data.date || '',
      type_id: payment?.data.data.type_id || 0,
      transaction_reference: payment?.data.data.transaction_reference || '',
      private_notes: payment?.data.data.private_notes || '',
    },
    onSubmit: (values) => {
      console.log('values', values);
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      axios
        .put(endpoint('/api/v1/payments/:id', { id }), values, {
          headers: defaultHeaders,
        })
        .then((data) => {
          console.log(data);
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

  return (
    <Default>
      <Container>
        <Card
          title={t('edit_payment')}
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          withSaveButton
        >
          <div className="bg-white p-8 w-full rounded shadow my-4">
            <Element leftSide="Number">
              <InputField
                id="number"
                label={t('payment_number')}
                value={formik.values.number}
              ></InputField>
            </Element>
            <Element leftSide="Amount">
              <InputField
                label={t('amount')}
                type="number"
                id="amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                errorMessage={errors?.errors.payment_amount}
              ></InputField>
            </Element>
            <Element leftSide="Date">
              <InputField
                id="date"
                label={t('payment_date')}
                type="date"
                value={formik.values.date}
              ></InputField>
            </Element>
            <Element leftSide="payment_type">
              <InputField
                id="payment_type"
                label={t('payment_type')}
                value={formik.values.type_id}
              ></InputField>
            </Element>
            <Element leftSide="payment_reference">
              <InputField
                id="transaction_reference"
                label={t('transaction_reference')}
                value={formik.values.transaction_reference}
              ></InputField>
            </Element>
            <Element leftSide="private_notes">
              <Textarea label={t('private_notes')}></Textarea>
            </Element>
            <Element leftSide="Change currency">
              <Toggle></Toggle>{' '}
            </Element>
          </div>
        </Card>
      </Container>
    </Default>
  );
}
