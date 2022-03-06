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
import { InvoiceStatus } from 'common/enums/invoice-status';
import { endpoint } from 'common/helpers';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useClientsQuery } from 'common/queries/clients';
import { defaultHeaders } from 'common/queries/common/headers';
import { useBlankPaymentQuery } from 'common/queries/payments';
import { useStaticsQuery } from 'common/queries/statics';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';
import { Invoices } from '../components/Invoices';

export function Create() {
  const [t] = useTranslation();
  const [invoiceBasedPayment, setinvoiceBasedPayment] = useState();
  const [clientBasedPayment, setclientBasedPayment] = useState();
  const [selectedInvoices, setselectedInvoices] = useState([]);
  const [amount, setamount] = useState(0)
  const { data: payment } = useBlankPaymentQuery();
  const pages: BreadcrumRecord[] = [
    { name: t('payments'), href: '/payments' },
    {
      name: t('new_payment'),
      href: '/payments',
    },
  ];
  const [invoices, setinvoices] = useState([]);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<ValidationBag>();
  const { data: clients } = useClientsQuery();
  const { data: statics } = useStaticsQuery();
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      client_id: payment?.data.data.client_id || '',

      amount: payment?.data.data.amount || 0,
      date: payment?.data.data.date || '',
      type_id: payment?.data.data.type_id || '',
      transaction_reference: payment?.data.data.transaction_reference || '',
      private_notes: payment?.data.data.private_notes || '',
      exchange_currency_id: payment?.data.data.exchange_currency_id || '',
      exchange_rate: payment?.data.data.exchange_rate,
      invoices: payment?.data.data.invoices||[],
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      axios
        .post(endpoint('/api/v1/payments'), values, {
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
          queryClient.invalidateQueries(generatePath('/api/v1/payments'));
        });
    },
  });

  useEffect(() => {
    axios
      .get(
        endpoint('/api/v1/invoices?client_id=:id', {
          id: formik.values.client_id,
        }),
        { headers: defaultHeaders }
      )
      .then((data) => {
        console.log('data', data.data.data);
        setinvoices(data?.data.data);
      });
  }, [formik.values.client_id]);

  const [changeCurrency, setchangeCurrency] = useState(false);
  useEffect(() => {
    setchangeCurrency(Boolean(payment?.data.data.exchange_currency_id));
  }, [payment]);

  const getExchangeRate = (fromCurrencyId: string, toCurrencyId: string) => {
    if (fromCurrencyId == null || toCurrencyId == null) {
      return 1;
    }
    const fromCurrency = statics?.data.currencies.find(
      (data: any) => data.id === payment?.data.data.currency_id
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
    <Default
      breadcrumbs={pages}
      title={t('new_payment')}
      docsLink="docs/payments/"
    >
      {console.log("empty payment",payment?.data.data)}
      <Container>
        <Card
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          withSaveButton
        >
          <div className="bg-white p-6 w-full rounded shadow ">
            <Element leftSide={t('client')}>
              <SelectField id="client_id" onChange={formik.handleChange}>
                {clients?.data.data.map((value: any, index: any) => {
                  if (value.archived_at === 0 && value.is_deleted === false)
                    return (
                      <option key={index} value={value.id}>
                        {value.display_name}
                      </option>
                    );
                })}
              </SelectField>
            </Element>
            <Element leftSide={t('amount')}>
              <InputField
                id="amount"
                disabled
                onChange={formik.handleChange}
                value={amount}
                errorMessage={errors?.errors.payment_amount}
              ></InputField>
            </Element>
            <Element leftSide={t('invoice')}>
              <SelectField
                onChange={(event: any) => {
                  console.log("change value",event.target.value)
                   formik.values.invoices.push(invoices.filter((invoice:any)=>invoice.id===event.target.value));
                  formik.setFieldValue('invoices', formik.values.invoices);
                }}
              >
                {
                  invoices?.map((value: any, index: any) => {
                    if (value.status_id !== InvoiceStatus.Paid)
                      return (
                        <option key={index} value={value.id}>
                          {value.number}
                        </option>
                      );
                  })}
              </SelectField>
              {console.log("formik data",formik.values)}
            </Element>
            {} <Invoices data={invoices} formik={formik}></Invoices>
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
                      <option key={index} value={String(value[0])} selected>
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
            <Element leftSide={t('send_email')}>
              <Toggle
                checked={formik.values.exchange_currency_id}
                onChange={() => {
                  setchangeCurrency(!changeCurrency);
                  formik.setFieldValue('exchange_currency_id', '');
                  formik.setFieldValue('exchange_rate', '');
                }}
              />
            </Element>
            <Element leftSide={t('convert_currency')}>
              <Toggle
                checked={formik.values.exchange_currency_id}
                onChange={() => {
                  setchangeCurrency(!changeCurrency);
                  formik.setFieldValue('exchange_currency_id', '');
                  formik.setFieldValue('exchange_rate', '');
                }}
              />
            </Element>
          </div>
          {changeCurrency && (
            <div className="bg-white p-6 w-full rounded shadow my-3 z-30">
              <Element leftSide={t('currency')}>
                <SelectField
                  onChange={(event: any) => {
                    formik.setFieldValue(
                      'exchange_rate',
                      getExchangeRate(
                        payment?.data.data.currency_id,
                        event.target.value
                      )
                    );
                    formik.setFieldValue(
                      'exchange_currency_id',
                      event.target.value
                    );
                  }}
                >
                  {statics?.data.currencies.map((element: any, index: any) => {
                    if (element.id === formik.values.exchange_currency_id) {
                      return (
                        <option value={element.id} key={index} selected>
                          {element.name}
                        </option>
                      );
                    } else
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
                ></InputField>
              </Element>
              {}
              <Element leftSide={t('converted_amount')}>
                <InputField
                  value={formik.values.amount * formik.values.exchange_rate}
                ></InputField>
              </Element>
            </div>
          )}
        </Card>
      </Container>
    </Default>
  );
}
