/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Button, InputField, SelectField } from '$app/components/forms';
import collect from 'collect.js';
import paymentType from '$app/common/constants/payment-type';
import { useCreditResolver } from '$app/common/hooks/credits/useCreditResolver';
import { useInvoiceResolver } from '$app/common/hooks/invoices/useInvoiceResolver';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { Payment } from '$app/common/interfaces/payment';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankPaymentQuery } from '$app/common/queries/payments';
import { Divider } from '$app/components/cards/Divider';
import { Container } from '$app/components/Container';
import { ConvertCurrency } from '$app/components/ConvertCurrency';
import { CustomField } from '$app/components/CustomField';

import Toggle from '$app/components/forms/Toggle';
import { Default } from '$app/components/layouts/Default';
import { FormEvent, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useHandleCredit } from './hooks/useHandleCredit';
import { useHandleInvoice } from './hooks/useHandleInvoice';
import { useSave } from './hooks/useSave';
import { Alert } from '$app/components/Alert';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { ComboboxAsync } from '$app/components/forms/Combobox';
import { endpoint } from '$app/common/helpers';
import { useAtom } from 'jotai';
import { paymentAtom } from '../common/atoms';

export interface PaymentOnCreation
  extends Omit<Payment, 'invoices' | 'credits'> {
  invoices: PaymentInvoice[];
  credits: PaymentCredit[];
}

interface PaymentInvoice {
  _id: string;
  amount: number;
  invoice_id: string;
}

interface PaymentCredit {
  _id: string;
  amount: number;
  credit_id: string;
}

export default function Create() {
  const { documentTitle } = useTitle('create_payment');

  const [t] = useTranslation();
  const [searchParams] = useSearchParams();

  const pages = [
    { name: t('payments'), href: '/payments' },
    { name: t('new_payment'), href: '/payments/create' },
  ];

  const company = useCurrentCompany();
  const invoiceResolver = useInvoiceResolver();
  const creditResolver = useCreditResolver();
  const formatMoney = useFormatMoney();

  const [payment, setPayment] = useAtom(paymentAtom);
  const [errors, setErrors] = useState<ValidationBag>();
  const [sendEmail, setSendEmail] = useState(
    company?.settings?.client_manual_payment_notification
  );
  const [convertCurrency, setConvertCurrency] = useState(false);

  const { data: blankPayment } = useBlankPaymentQuery();

  useEffect(() => {
    setPayment((current) => {
      let value = current;

      if (
        searchParams.get('action') !== 'enter' &&
        searchParams.get('action') !== 'apply'
      ) {
        value = undefined;
      }

      if (typeof blankPayment !== 'undefined' && typeof value === 'undefined') {
        value = {
          ...blankPayment.data.data,
          invoices: [],
          credits: [],
          client_id: '',
          type_id: company?.settings?.payment_type_id ?? '',
        };
      }

      return value;
    });

    if (searchParams.has('client')) {
      setPayment(
        (current) =>
          current && {
            ...current,
            client_id: searchParams.get('client') as string,
          }
      );
    }

    if (searchParams.has('client') && searchParams.has('invoice')) {
      invoiceResolver
        .find(searchParams.get('invoice') as string)
        .then((invoice) =>
          setPayment(
            (current) =>
              current && {
                ...current,
                invoices: [
                  {
                    _id: v4(),
                    invoice_id: invoice.id,
                    amount:
                      invoice.balance > 0 ? invoice.balance : invoice.amount,
                  },
                ],
              }
          )
        );
    }

    if (searchParams.has('client') && searchParams.has('credit')) {
      creditResolver.find(searchParams.get('credit') as string).then((credit) =>
        setPayment(
          (current) =>
            current && {
              ...current,
              credits: [
                {
                  _id: v4(),
                  credit_id: credit.id,
                  amount: credit.balance > 0 ? credit.balance : credit.amount,
                },
              ],
            }
        )
      );
    }

    if (searchParams.has('type')) {
      setPayment(
        (current) =>
          current && { ...current, type_id: searchParams.get('type') ?? '' }
      );
    }
  }, [blankPayment]);

  useEffect(() => {
    setPayment(
      (current) =>
        current && {
          ...current,
          currency_id: current.client?.settings.currency_id
          // amount: collect(payment?.invoices).sum('amount') as number,
        }
    );
  }, [payment?.invoices]);

  const {
    handleInvoiceChange,
    handleExistingInvoiceChange,
    handleInvoiceInputChange,
    handleDeletingInvoice,
  } = useHandleInvoice({ payment, setPayment });

  const {
    handleCreditChange,
    handleExistingCreditChange,
    handleCreditInputChange,
    handleDeletingCredit,
  } = useHandleCredit({
    payment,
    setPayment,
  });

  const handleChange = <
    TField extends keyof PaymentOnCreation,
    TValue extends PaymentOnCreation[TField]
  >(
    field: TField,
    value: TValue
  ) => {
    setPayment((current) => current && { ...current, [field]: value });

    console.log(payment);
  };

  const onSubmit = useSave(setErrors);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(payment as unknown as Payment, sendEmail);
      }}
      disableSaveButton={!payment}
    >
      <Container>
        <Card title={t('enter_payment')}>
          <Element leftSide={t('client')}>
            <ClientSelector
              onChange={(client) => {
                handleChange('client_id', client?.id as string);
                handleChange('currency_id', client?.settings.currency_id);
                handleChange('invoices', []);
                handleChange('credits', []);
              }}
              onClearButtonClick={() => {
                handleChange('client_id', '');
                handleChange('currency_id', '');
                handleChange('invoices', []);
                handleChange('credits', []);
              }}
              errorMessage={errors?.errors.client_id}
              defaultValue={payment?.client_id}
              value={payment?.client_id}
              readonly={
                searchParams.has('invoice') ||
                searchParams.get('action') === 'enter' ||
                searchParams.get('action') === 'apply'
              }
              initiallyVisible={!payment?.client_id}
            />
          </Element>

          <Element
            leftSide={t('amount_received')}
            leftSideHelp={t('amount_received_help')}
          >
            <InputField
              id="amount"
              type="number"
              value={payment?.amount}
              onValueChange={(value) =>
                handleChange(
                  'amount',
                  isNaN(parseFloat(value)) ? 0 : parseFloat(value)
                )
              }
              errorMessage={errors?.errors.amount}
            />
          </Element>

          {payment?.client_id && <Divider />}

          {payment &&
            payment.invoices.length > 0 &&
            payment.invoices.map((invoice, index) => (
              <Element key={index}>
                <div className="flex flex-col">
                  <div className="flex items-end space-x-2">
                    <ComboboxAsync<Invoice>
                      inputOptions={{
                        value: invoice.invoice_id,
                        label: t('invoice') ?? '',
                      }}
                      endpoint={
                          endpoint(
                            `/api/v1/invoices?payable=${payment.client_id}&per_page=100`
                          )
                      }
                      entryOptions={{
                        label: 'number',
                        id: 'id',
                        value: 'id',
                        searchable: 'number',
                      }}
                      onChange={(entry) =>
                        entry.resource
                          ? handleExistingInvoiceChange(entry.resource, index)
                          : null
                      }
                      exclude={collect(
                        payment.invoices.filter(
                          ({ invoice_id }) => invoice_id !== invoice.invoice_id
                        )
                      )
                        .pluck('invoice_id')
                        .toArray()}
                    />

                    <InputField
                      type="number"
                      label={t('amount_received')}
                      onValueChange={(value) =>
                        handleInvoiceInputChange(
                          index,
                          isNaN(parseFloat(value)) ? 0 : parseFloat(value)
                        )
                      }
                      className="w-full"
                      value={invoice.amount}
                      withoutLabelWrapping
                    />

                    <Button
                      behavior="button"
                      type="minimal"
                      className="self-center mt-6"
                      onClick={() => handleDeletingInvoice(invoice._id)}
                    >
                      <X />
                    </Button>
                  </div>

                  {errors?.errors[`invoices.${index}.amount`] && (
                    <Alert className="mt-2" type="danger">
                      {errors?.errors[`invoices.${index}.amount`]}
                    </Alert>
                  )}

                  {errors?.errors[`invoices.${index}.invoice_id`] && (
                    <Alert className="mt-2" type="danger">
                      {errors?.errors[`invoices.${index}.invoice_id`]}
                    </Alert>
                  )}
                </div>
              </Element>
            ))}

          {payment?.client_id && (
            <Element leftSide={t('invoices')}>
              <ComboboxAsync<Invoice>
                endpoint={
                    endpoint(`/api/v1/invoices?payable=${payment?.client_id}&per_page=100`)
                }
                inputOptions={{
                  value: 'id',
                }}
                entryOptions={{
                  id: 'id',
                  value: 'id',
                  label: 'name',
                  searchable: 'number',
                  dropdownLabelFn: (invoice) =>
                    `${t('invoice_number_short')}${invoice.number} - ${t(
                      'balance'
                    )} ${formatMoney(
                      invoice.balance,
                      payment.client?.country_id,
                      payment.client?.settings.currency_id
                    )}`,
                }}
                onChange={({ resource }) =>
                  resource ? handleInvoiceChange(resource) : null
                }
                exclude={collect(payment.invoices)
                  .pluck('invoice_id')
                  .toArray()}
                clearInputAfterSelection
              />
            </Element>
          )}

          {payment?.client_id && <Divider />}

          {payment &&
            payment.credits.length > 0 &&
            payment.credits.map((credit, index) => (
              <Element key={index}>
                <div className="flex flex-col">
                  <div className="flex items-end space-x-2">
                    <ComboboxAsync<Credit>
                      inputOptions={{
                        value: credit.credit_id,
                        label: t('credit') ?? '',
                      }}
                      endpoint={
                          endpoint(
                            `/api/v1/credits?client_id=${payment.client_id}&per_page=100`
                          )
                      }
                      entryOptions={{
                        id: 'id',
                        value: 'id',
                        label: 'number',
                        searchable: 'number',
                        dropdownLabelFn: (credit) =>
                          `${t('credit')} #${credit.number} - ${t(
                            'balance'
                          )} ${formatMoney(
                            credit.balance,
                            payment.client?.country_id,
                            payment.client?.settings.currency_id
                          )}`,
                      }}
                      onChange={(entry) =>
                        entry.resource
                          ? handleExistingCreditChange(entry.resource, index)
                          : null
                      }
                      exclude={collect(
                        payment.credits.filter(
                          ({ credit_id }) => credit_id !== credit.credit_id
                        )
                      )
                        .pluck('credit_id')
                        .toArray()}
                    />

                    <InputField
                      type="number"
                      label={t('amount')}
                      onValueChange={(value) =>
                        handleCreditInputChange(
                          index,
                          isNaN(parseFloat(value)) ? 0 : parseFloat(value)
                        )
                      }
                      className="w-full"
                      value={credit.amount}
                      withoutLabelWrapping
                    />

                    <Button
                      behavior="button"
                      type="minimal"
                      className="self-center mt-6"
                      onClick={() => handleDeletingCredit(credit._id)}
                    >
                      <X />
                    </Button>
                  </div>

                  {errors?.errors[`credits.${index}.amount`] && (
                    <Alert className="mt-2" type="danger">
                      {errors?.errors[`credits.${index}.amount`]}
                    </Alert>
                  )}

                  {errors?.errors[`credits.${index}.credit_id`] && (
                    <Alert className="mt-2" type="danger">
                      {errors?.errors[`credits.${index}.credit_id`]}
                    </Alert>
                  )}
                </div>
              </Element>
            ))}

          {payment?.client_id && (
            <Element leftSide={t('credits')}>
              <ComboboxAsync<Credit>
                endpoint={
                    endpoint(`/api/v1/credits?client_id=${payment.client_id}`)
                }
                inputOptions={{
                  value: null,
                }}
                entryOptions={{
                  id: 'id',
                  label: 'number',
                  value: 'id',
                  searchable: 'number',
                  dropdownLabelFn: (credit) =>
                    `${t('credit')} #${credit.number} - ${t(
                      'balance'
                    )} ${formatMoney(
                      credit.balance,
                      payment.client?.country_id,
                      payment.client?.settings.currency_id
                    )}`,
                }}
                onChange={(entry) =>
                  entry.resource ? handleCreditChange(entry.resource) : null
                }
                exclude={collect(payment.credits).pluck('credit_id').toArray()}
                clearInputAfterSelection
              />
            </Element>
          )}

          {payment?.client_id && <Divider />}

          <Element leftSide={t('payment_date')}>
            <InputField
              type="date"
              id="date"
              value={payment?.date}
              onValueChange={(value) => handleChange('date', value)}
              errorMessage={errors?.errors.date}
            />
          </Element>

          <Element leftSide={t('payment_type')}>
            <SelectField
              id="type_id"
              value={payment?.type_id}
              onValueChange={(value) => handleChange('type_id', value)}
              errorMessage={errors?.errors.type_id}
              withBlank
            >
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
              onValueChange={(value) =>
                handleChange('transaction_reference', value)
              }
              errorMessage={errors?.errors.transaction_reference}
            />
          </Element>

          <Element leftSide={t('private_notes')}>
            <InputField
              element="textarea"
              id="private_notes"
              onValueChange={(value) => handleChange('private_notes', value)}
              errorMessage={errors?.errors.private_notes}
            />
          </Element>

          {company?.custom_fields?.payment1 && (
            <CustomField
              field="payment1"
              defaultValue={payment?.custom_value1}
              value={company?.custom_fields?.payment1}
              onValueChange={(value) =>
                handleChange('custom_value1', value.toString())
              }
            />
          )}

          {company?.custom_fields?.payment2 && (
            <CustomField
              field="payment2"
              defaultValue={payment?.custom_value2}
              value={company?.custom_fields?.payment2}
              onValueChange={(value) =>
                handleChange('custom_value2', value.toString())
              }
            />
          )}

          {company?.custom_fields?.payment3 && (
            <CustomField
              field="payment3"
              defaultValue={payment?.custom_value3}
              value={company?.custom_fields?.payment3}
              onValueChange={(value) =>
                handleChange('custom_value3', value.toString())
              }
            />
          )}

          {company?.custom_fields?.payment4 && (
            <CustomField
              field="payment4"
              defaultValue={payment?.custom_value4}
              value={company?.custom_fields?.payment4}
              onValueChange={(value) =>
                handleChange('custom_value4', value.toString())
              }
            />
          )}

          <Element leftSide={t('send_email')}>
            <Toggle checked={sendEmail} onChange={setSendEmail} />
          </Element>

          <Element leftSide={t('convert_currency')}>
            <Toggle
              checked={Boolean(payment?.exchange_currency_id)}
              onChange={(value) => {
                setConvertCurrency(value);

                if (!value)
                  handleChange('exchange_currency_id', '');
                else
                  handleChange('exchange_currency_id', '1')

                handleChange('exchange_rate', 1);
              }}
            />
          </Element>

          {convertCurrency && payment && (
            <ConvertCurrency
              exchangeRate={payment.exchange_rate.toString() || '1'}
              exchangeCurrencyId={payment.exchange_currency_id}
              currencyId={payment.currency_id || '1'}
              amount={collect(payment?.invoices).sum('amount') as number + payment?.amount ?? 0}
              onChange={(exchangeRate, exchangeCurrencyId) => {
                handleChange('exchange_rate', exchangeRate);
                handleChange('exchange_currency_id', exchangeCurrencyId);
              }}
              onExchangeRateChange={(value) =>
                handleChange('exchange_rate', value)
              }
            />
          )}
        </Card>
      </Container>
    </Default>
  );
}
