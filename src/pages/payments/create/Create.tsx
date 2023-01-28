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
import { Button, InputField, SelectField } from '@invoiceninja/forms';
import collect from 'collect.js';
import paymentType from 'common/constants/payment-type';
import { route } from 'common/helpers/route';
import { useCreditResolver } from 'common/hooks/credits/useCreditResolver';
import { useInvoiceResolver } from 'common/hooks/invoices/useInvoiceResolver';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
import { Credit } from 'common/interfaces/credit';
import { Invoice } from 'common/interfaces/invoice';
import { Payment } from 'common/interfaces/payment';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankPaymentQuery } from 'common/queries/payments';
import { Divider } from 'components/cards/Divider';
import { Container } from 'components/Container';
import { ConvertCurrency } from 'components/ConvertCurrency';
import { CustomField } from 'components/CustomField';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { ValidationAlert } from 'components/ValidationAlert';
import { FormEvent, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useHandleCredit } from './hooks/useHandleCredit';
import { useHandleInvoice } from './hooks/useHandleInvoice';
import { useSave } from './hooks/useSave';

export interface PaymentOnCreation extends Omit<Payment, 'invoices'> {
  invoices: Paymentable[];
  credits: Paymentable[];
}

interface Paymentable {
  _id: string;
  amount: number;
  credit_id: string;
  invoice_id: string;
}

export function Create() {
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

  const [payment, setPayment] = useState<PaymentOnCreation>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [sendEmail, setSendEmail] = useState(false);
  const [convertCurrency, setConvertCurrency] = useState(false);

  const { data: blankPayment } = useBlankPaymentQuery();

  useEffect(() => {
    if (blankPayment?.data.data) {
      setPayment({
        ...blankPayment.data.data,
        invoices: [],
        credits: [],
        client_id: '',
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
                      credit_id: '',
                    },
                  ],
                }
            )
          );
      }

      if (searchParams.has('client') && searchParams.has('credit')) {
        creditResolver
          .find(searchParams.get('credit') as string)
          .then((credit) =>
            setPayment(
              (current) =>
                current && {
                  ...current,
                  credits: [
                    {
                      _id: v4(),
                      credit_id: credit.id,
                      amount:
                        credit.balance > 0 ? credit.balance : credit.amount,
                      invoice_id: '',
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
    }
  }, [blankPayment]);

  useEffect(() => {
    setPayment(
      (current) =>
        current && {
          ...current,
          amount: collect(payment?.invoices).sum('amount') as number,
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
        {errors && <ValidationAlert errors={errors} />}

        <Card title={t('enter_payment')}>
          <Element leftSide={t('client')}>
            <DebouncedCombobox
              endpoint="/api/v1/clients"
              label="name"
              onChange={(value: Record<Client>) => {
                handleChange('client_id', value.resource?.id as string);

                handleChange(
                  'currency_id',
                  value.resource?.settings.currency_id
                );
              }}
              defaultValue={payment?.client_id}
              errorMessage={errors?.errors.client_id}
            />
          </Element>

          <Element leftSide={t('amount_received')}>
            <InputField
              id="amount"
              value={payment?.amount}
              onValueChange={(value) =>
                handleChange('amount', parseFloat(value))
              }
              errorMessage={errors?.errors.amount}
            />
          </Element>

          {payment?.client_id && <Divider />}

          {payment &&
            payment.invoices.length > 0 &&
            payment.invoices.map((invoice, index) => (
              <Element key={index}>
                <div className="flex items-center space-x-2">
                  <DebouncedCombobox
                    className="w-1/2"
                    inputLabel={t('invoice')}
                    endpoint={route('/api/v1/invoices?payable=:clientId', {
                      clientId: payment.client_id,
                    })}
                    label="number"
                    onChange={(value: Record<Invoice>) =>
                      value.resource &&
                      handleExistingInvoiceChange(value.resource, index)
                    }
                    defaultValue={invoice.invoice_id}
                    queryAdditional
                  />

                  <InputField
                    label={t('amount_received')}
                    onValueChange={(value) =>
                      handleInvoiceInputChange(index, parseFloat(value))
                    }
                    className="w-full"
                    value={invoice.amount}
                  />

                  <Button
                    behavior="button"
                    type="minimal"
                    className="mt-6"
                    onClick={() => handleDeletingInvoice(invoice._id)}
                  >
                    <X />
                  </Button>
                </div>
              </Element>
            ))}

          {payment?.client_id && (
            <Element leftSide={t('invoices')}>
              <DebouncedCombobox
                endpoint={route('/api/v1/invoices?payable=:clientId', {
                  clientId: payment.client_id,
                })}
                label="number"
                clearInputAfterSelection
                onChange={(value: Record<Invoice>) =>
                  value.resource && handleInvoiceChange(value.resource)
                }
                formatLabel={(resource: Invoice) =>
                  `${t('invoice_number_short')} ${
                    resource.number
                  } (${formatMoney(
                    resource.amount,
                    resource?.client?.country_id ?? '1',
                    resource?.client?.settings.currency_id
                  )})`
                }
                exclude={collect(payment.invoices)
                  .pluck('invoice_id')
                  .toArray()}
              />
            </Element>
          )}

          {payment?.client_id && <Divider />}

          {payment &&
            payment.credits.length > 0 &&
            payment.credits.map((credit, index) => (
              <Element key={index}>
                <div className="flex items-center space-x-2">
                  <DebouncedCombobox
                    className="w-1/2"
                    inputLabel={t('credit')}
                    endpoint={route('/api/v1/credits?client_id=:clientId', {
                      clientId: payment.client_id,
                    })}
                    label="number"
                    onChange={(value: Record<Credit>) =>
                      value.resource &&
                      handleExistingCreditChange(value.resource, index)
                    }
                    defaultValue={credit.credit_id}
                    queryAdditional
                  />

                  <InputField
                    label={t('amount')}
                    onValueChange={(value) =>
                      handleCreditInputChange(index, parseFloat(value))
                    }
                    className="w-full"
                    value={credit.amount}
                  />

                  <Button
                    behavior="button"
                    type="minimal"
                    className="mt-6"
                    onClick={() => handleDeletingCredit(credit._id)}
                  >
                    <X />
                  </Button>
                </div>
              </Element>
            ))}

          {payment?.client_id && (
            <Element leftSide={t('credits')}>
              <DebouncedCombobox
                endpoint={route('/api/v1/credits?client_id=:clientId', {
                  clientId: payment.client_id,
                })}
                label="number"
                clearInputAfterSelection
                onChange={(value: Record<Credit>) =>
                  value.resource && handleCreditChange(value.resource)
                }
                formatLabel={(resource: Credit) =>
                  `${resource.number} (${formatMoney(
                    resource.amount,
                    resource?.client?.country_id ?? '1',
                    resource?.client?.settings.currency_id
                  )})`
                }
                exclude={collect(payment.credits).pluck('credit_id').toArray()}
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

                handleChange('exchange_currency_id', '');
                handleChange('exchange_rate', 1);
              }}
            />
          </Element>

          {convertCurrency && payment && (
            <ConvertCurrency
              exchangeRate={payment.exchange_rate.toString() || '1'}
              exchangeCurrencyId={payment.exchange_currency_id || '1'}
              currencyId={payment.currency_id || '1'}
              amount={payment?.amount}
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
