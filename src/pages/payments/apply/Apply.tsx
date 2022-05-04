/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button, InputField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import { usePaymentQuery } from 'common/queries/payments';
import { Alert } from 'components/Alert';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { v4 } from 'uuid';

export function Apply() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [t] = useTranslation();
  const { data: payment } = usePaymentQuery({ id });
  const [errors, setErrors] = useState<ValidationBag>();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      invoices: [],
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      axios
        .put(endpoint('/api/v1/payments/:id', { id }), values, {
          headers: defaultHeaders(),
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
  const handleInvoiceChange = (id: string, amount: number) => {
    formik.setFieldValue('invoices', [
      ...formik.values.invoices,
      { _id: v4(), amount, credit_id: '', invoice_id: id },
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

  useEffect(() => {
    let total = 0;
    formik.values.invoices.map((invoice: any) => {
      total = total + Number(invoice.amount);
    });
  }, [formik.values.invoices]);

  return (
    <Card
      title={t('apply_payment')}
      disableSubmitButton={formik.isSubmitting}
      onFormSubmit={formik.handleSubmit}
      withSaveButton
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
      <Element leftSide={t('invoices')}>
        <DebouncedCombobox
          endpoint={`/api/v1/invoices?status_id=1,2,3&is_deleted=false&client_id=${payment?.data.data.client_id}`}
          label="number"
          onChange={(value: Record<Invoice>) =>
            handleInvoiceChange(
              value.resource?.id as string,
              value.resource?.amount as number
            )
          }
        />
        {errors?.errors.invoices && (
          <div className="py-2">
            <Alert type="danger">{errors.errors.invoices}</Alert>
          </div>
        )}
      </Element>
      {formik.values.invoices.map(
        (record: { _id: string; amount: number }, index) => (
          <Element key={index} leftSide={t('applied')}>
            <div className="flex items-center space-x-2">
              <InputField
                id={`invoices[${index}].amount`}
                onChange={formik.handleChange}
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

            {errors?.errors[`invoices.${[index]}.invoice_id`] && (
              <div className="py-2">
                <Alert type="danger">
                  {errors.errors[`invoices.${[index]}.invoice_id`]}
                </Alert>
              </div>
            )}
          </Element>
        )
      )}
    </Card>
  );
}
