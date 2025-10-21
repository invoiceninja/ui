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
import { InputField, InputLabel } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { usePaymentQuery } from '$app/common/queries/payments';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { useColorScheme } from '$app/common/colors';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { DataTable } from '$app/components/DataTable';
import { Invoice } from '$app/common/interfaces/invoice';
import { emitter } from '$app';
import { useApplyInvoiceTableColumns } from '../common/hooks/useApplyInvoiceTableColumns';

export default function Apply() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const columns = useApplyInvoiceTableColumns();

  const { data: payment } = usePaymentQuery({ id });

  const [errors, setErrors] = useState<ValidationBag>();

  const navigate = useNavigate();
  const formatMoney = useFormatMoney();

  const calcApplyAmount = (balance: number, currentInvoices: Invoice[]) => {
    if (payment) {
      const unapplied = payment?.amount - payment?.applied;

      let invoices_total = 0;
      currentInvoices.map((invoice: any) => {
        invoices_total = invoices_total + Number(invoice.amount);
      });

      return Math.min(unapplied - invoices_total, balance);
    }

    return balance;
  };

  const calcApplyBalance = () => {
    if (payment) {
      const unapplied = payment?.amount - payment?.applied;

      let total = 0;
      formik.values.invoices.map((invoice: any) => {
        total = total + Number(invoice.amount);
      });

      return unapplied - total;
    }

    return 0;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      invoices: [],
    },
    onSubmit: (values) => {
      toast.processing();
      setErrors(undefined);

      request('PUT', endpoint('/api/v1/payments/:id', { id }), values)
        .then((data) => {
          toast.success('updated_payment');
          navigate(route('/payments/:id/edit', { id: data.data.data.id }));
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => {
          formik.setSubmitting(false);

          $refetch(['payments', 'invoices', 'clients', 'credits']);
        });
    },
  });

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
    <Card
      title={t('apply_payment')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <Element leftSide={t('number')}>{payment?.number}</Element>

      {payment && payment.client && (
        <>
          <Element leftSide={t('amount')}>
            {formatMoney(
              payment?.amount,
              payment.client?.country_id,
              payment.client?.settings.currency_id
            )}
          </Element>

          <Element leftSide={t('applied')}>
            {formatMoney(
              payment?.applied,
              payment.client?.country_id,
              payment.client?.settings.currency_id
            )}
          </Element>

          <Element leftSide={t('unapplied')}>
            {formatMoney(
              payment?.amount - payment?.applied,
              payment.client?.country_id,
              payment.client?.settings.currency_id
            )}
            {formik.values.invoices.length >= 1 &&
              `  - (${formatMoney(
                calcApplyBalance(),
                payment.client?.country_id,
                payment.client?.settings.currency_id
              )} ${t('remaining')})`}
          </Element>
        </>
      )}

      <>
        {payment?.client_id ? (
          <div className="flex flex-col px-4 sm:px-6 gap-y-2 mt-4">
            <InputLabel>{t('invoices')}</InputLabel>

            <DataTable<Invoice>
              resource="invoice"
              endpoint={`/api/v1/invoices?payable=${payment?.client_id}&per_page=100&sort=date|desc&per_page=1000`}
              columns={columns}
              onSelectedResourcesChange={(selectedResources) => {
                if (selectedResources.length > 0) {
                  const newInvoices: any[] = [];

                  selectedResources.forEach((resource: Invoice) => {
                    newInvoices.push({
                      _id: v4(),
                      amount: calcApplyAmount(resource.balance, newInvoices),
                      credit_id: '',
                      invoice_id: resource.id,
                      number: resource.number,
                    });
                  });

                  formik.setFieldValue('invoices', newInvoices);
                } else {
                  formik.setFieldValue('invoices', []);
                }
              }}
              withoutPagination
              withoutStatusFilter
              withoutAllBulkActions
            />
          </div>
        ) : null}

        {errors?.errors.invoices && (
          <div className="py-2">
            <ErrorMessage>{errors.errors.invoices}</ErrorMessage>
          </div>
        )}
      </>

      {formik.values.invoices.map(
        (
          record: {
            _id: string;
            amount: number;
            number: string;
            balance: number;
            invoice_id: string;
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
              <NumberInputField
                label={t('amount_received')}
                value={record.amount || ''}
                onValueChange={(value) =>
                  formik.setFieldValue(
                    `invoices.${index}.amount`,
                    parseFloat(value)
                  )
                }
              />

              <div
                className="cursor-pointer focus:outline-none focus:ring-0 mt-6"
                onClick={() =>
                  emitter.emit('deselect.resource', record.invoice_id)
                }
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

            {errors?.errors[`invoices.${[index]}.invoice_id`] && (
              <div className="py-2">
                <ErrorMessage>
                  {errors.errors[`invoices.${[index]}.invoice_id`]}
                </ErrorMessage>
              </div>
            )}
          </Element>
        )
      )}
    </Card>
  );
}
