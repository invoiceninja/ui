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
import { Button, InputField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { usePaymentQuery } from '$app/common/queries/payments';
import { Alert } from '$app/components/Alert';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import collect from 'collect.js';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { ComboboxAsync } from '$app/components/forms/Combobox';

export default function Apply() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [t] = useTranslation();
  const { data: payment, isLoading } = usePaymentQuery({ id });
  const [errors, setErrors] = useState<ValidationBag>();
  const navigate = useNavigate();
  const formatMoney = useFormatMoney();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      invoices: [],
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);

      request('PUT', endpoint('/api/v1/payments/:id', { id }), values)
        .then((data) => {
          toast.success(t('updated_payment'), { id: toastId });
          navigate(route('/payments/:id/edit', { id: data.data.data.id }));
        })
        .catch((error: AxiosError<ValidationBag>) => {
          console.error(error);
          toast.error(t('error_title'), { id: toastId });
          if (error.response?.status === 422) {
            setErrors(error.response.data);
          }
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries(route('/api/v1/payments/:id', { id }));
        });
    },
  });
  const handleInvoiceChange = (id: string, amount: number, number: string) => {
    formik.setFieldValue('invoices', [
      ...formik.values.invoices,
      { _id: v4(), amount, credit_id: '', invoice_id: id, number: number },
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

  useSaveBtn(
    {
      onClick: () => formik.submitForm(),
      disableSaveButton: formik.isSubmitting,
    },
    [formik.values, formik.isSubmitting]
  );

  return (
    <Card title={t('apply_payment')}>
      <Element leftSide={t('number')}>
        <InputField disabled value={payment?.number} />
      </Element>

      {payment && payment.client && (
        <>
          <Element leftSide={t('amount')}>
            <InputField
              disabled
              value={formatMoney(
                payment?.amount - payment?.refunded,
                payment?.client.country_id,
                payment?.client.settings.currency_id
              )}
            />
          </Element>
          <Element leftSide={t('applied')}>
            <InputField
              disabled
              value={formatMoney(
                payment?.applied,
                payment?.client.country_id,
                payment?.client.settings.currency_id
              )}
            />
          </Element>
          <Element leftSide={t('unapplied')}>
            <InputField
              disabled
              value={formatMoney(
                payment?.amount - payment?.refunded - payment?.applied,
                payment?.client.country_id,
                payment?.client.settings.currency_id
              )}
            />
          </Element>
        </>
      )}

      <Element leftSide={t('invoices')}>
        {payment?.client_id ? (
          <ComboboxAsync<Invoice>
            endpoint={
              new URL(
                endpoint(`/api/v1/invoices?payable=${payment?.client_id}`)
              )
            }
            inputOptions={{
              value: 'id',
            }}
            entryOptions={{
              id: 'id',
              value: 'id',
              label: 'name',
              dropdownLabelFn: (invoice) =>
                `${t('invoice_number_short')}${invoice.number} - ${t(
                  'balance'
                )} ${formatMoney(
                  invoice.balance,
                  payment.client?.country_id ?? '1',
                  payment.client?.settings.currency_id ?? '1'
                )}`,
            }}
            onChange={({ resource }) =>
              resource
                ? handleInvoiceChange(
                    resource.id,
                    resource.balance,
                    resource.number
                  )
                : null
            }
            initiallyVisible={isLoading}
            exclude={collect(formik.values.invoices)
              .pluck('invoice_id')
              .toArray()}
          />
        ) : null}

        {errors?.errors.invoices && (
          <div className="py-2">
            <Alert type="danger">{errors.errors.invoices}</Alert>
          </div>
        )}
      </Element>

      {formik.values.invoices.map(
        (
          record: {
            _id: string;
            amount: number;
            number: string;
            balance: number;
          },
          index
        ) => (
          <Element key={index} leftSide={t('applied')}>
            <div className="flex items-center space-x-2">
              <InputField
                disabled
                label={t('invoice_number')}
                value={record.number}
              />
              <InputField
                label={t('amount_received')}
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
