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
import { InvoiceStatus } from 'common/enums/invoice-status';
import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import { usePaymentQuery } from 'common/queries/payments';
import { Alert } from 'components/Alert';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { useAllInvoicesQuery } from '../common/helpers/invoices-query';

export function Apply() {
    const queryClient=useQueryClient();
  const { id } = useParams();
  const [t] = useTranslation();
  const { data: payment } = usePaymentQuery({ id });
  const [allUserInvoices, setallUserInvoices] = useState<Invoice[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [invoices, setinvoices] = useState<string[]>([]);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      invoices: [],
    }
    , onSubmit: (values) => {
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



  const allinvocies = useAllInvoicesQuery();

  useEffect(() => {
    const filteredInvoices = allinvocies.filter((invoice: Invoice) => {
      if (
        invoice.client_id == payment?.data.data.client_id &&
        invoice.status_id != InvoiceStatus.Paid &&
        invoice.archived_at == 0
      ) {
        return invoice;
      }
    });

    setallUserInvoices(filteredInvoices);
  }, [allinvocies]);

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
            invoiceItem?.balance > payment?.data.data.amount
            ? payment?.data.data.amount
            : invoiceItem?.balance,
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
  }, [formik.values.invoices]);

  return (
    <Card title={t('apply_payment')}  disableSubmitButton={formik.isSubmitting}
    onFormSubmit={formik.handleSubmit}
    withSaveButton>
      <Element leftSide={t('number')}>
        <InputField value={payment?.data.data.number} />
      </Element>
      <Element leftSide={t('amount')}>
        <InputField disabled value={payment?.data.data.amount} />
      </Element>
      <Element leftSide={t('applied')}>
        <InputField disabled value={payment?.data.data.applied} />
      </Element>
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
                  {allUserInvoices.map((invoice: Invoice, index: number) => {
                    return (
                      <option key={index} value={invoice.id}>
                        {invoice.number}
                      </option>
                    );
                  })}
                </SelectField>
                {errors?.errors.invoices && (
              <Alert type="danger">{errors.errors.invoices}</Alert>
            )}
              </Element>
              {formik.values.invoices.map((invoiceitem: any, index: number) => {
                const invoiceItem = allUserInvoices.find(
                  (invoice: Invoice) => invoice.id == invoiceitem.invoice_id
                );


                if (invoiceItem)
                  return (
                    <Element key={index} leftSide={invoiceItem?.number}>
                      <InputField
                        id={`invoices[${index}].amount`}
                        value={
                          invoiceItem?.balance > payment?.data.data.amount
                            ? payment?.data.data.amount
                            : invoiceItem?.balance
                        }
                        onChange={formik.handleChange}
                      />
                     
                      {errors?.errors[`invoices.${[index]}.invoice_id`] && (
                        <Alert type="danger">
                          {errors.errors[`invoices.${[index]}.invoice_id`]}
                        </Alert>
                      )}
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
    </Card>
  );
}
