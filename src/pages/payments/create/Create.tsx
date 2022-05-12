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
import { useInvoiceResolver } from 'common/hooks/invoices/useInvoiceResolver';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Client } from 'common/interfaces/client';
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
import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { generatePath, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useSave } from './hooks/useSave';

interface PaymentOnCreation extends Payment {
  invoices: PaymentInvoice[];
}

interface PaymentInvoice {
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

  const [payment, setPayment] = useState<PaymentOnCreation>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [sendEmail, setSendEmail] = useState(false);
  const [convertCurrency, setConvertCurrency] = useState(false);

  const { data: blankPayment } = useBlankPaymentQuery();

  useEffect(() => {
    if (blankPayment?.data.data) {
      setPayment({ ...blankPayment.data.data, invoices: [], client_id: '' });

      if (searchParams.has('client')) {
        setPayment(
          (current) =>
            current && {
              ...current,
              client_id: searchParams.get('client') as string,
            }
        );
      }

      if (searchParams.has('invoice')) {
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

  const handleChange = <
    TField extends keyof PaymentOnCreation,
    TValue extends PaymentOnCreation[TField]
  >(
    field: TField,
    value: TValue
  ) => {
    setPayment((current) => current && { ...current, [field]: value });
  };

  const handleInvoiceChange = (invoice: Invoice) => {
    setPayment(
      (current) =>
        current && {
          ...current,
          invoices: [
            ...current.invoices,
            {
              _id: v4(),
              amount: invoice.balance > 0 ? invoice.balance : invoice.amount,
              credit_id: '',
              invoice_id: invoice.id,
            },
          ],
        }
    );
  };

  const handleInvoiceInputChange = (index: number, amount: number) => {
    const cloned = { ...payment } as PaymentOnCreation;

    cloned.invoices[index].amount = amount;

    setPayment({
      ...cloned,
      amount: collect(cloned.invoices).sum('amount') as number,
    });
  };

  const handleDeletingInvoice = (id: string) => {
    setPayment(
      (current) =>
        current && {
          ...current,
          invoices: current.invoices.filter((invoice) => invoice._id !== id),
        }
    );
  };

  const onSubmit = useSave(setErrors);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <Container>
        <Card
          title={t('enter_payment')}
          onFormSubmit={(event) => {
            event.preventDefault();

            payment && onSubmit(payment, sendEmail);
          }}
          withSaveButton
        >
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

          <Element leftSide={t('amount')}>
            <InputField
              id="amount"
              value={payment?.amount}
              onValueChange={(value) =>
                handleChange('amount', parseFloat(value))
              }
              errorMessage={errors?.errors.payment_amount}
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
                    endpoint={generatePath(
                      '/api/v1/invoices?payable=:clientId',
                      { clientId: payment.client_id }
                    )}
                    label="number"
                    onChange={(value: Record<Invoice>) =>
                      value.resource && handleInvoiceChange(value.resource)
                    }
                    value="amount"
                    defaultValue={payment.invoices[index].amount}
                  />

                  <InputField
                    label={t('applied')}
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
                endpoint={generatePath('/api/v1/invoices?payable=:clientId', {
                  clientId: payment.client_id,
                })}
                label="number"
                clearInputAfterSelection
                onChange={(value: Record<Invoice>) =>
                  value.resource && handleInvoiceChange(value.resource)
                }
                exclude={collect(payment.invoices)
                  .pluck('invoice_id')
                  .toArray()}
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
              defaultValue={payment?.type_id}
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
              onChange={(value) =>
                handleChange('custom_value1', value.toString())
              }
            />
          )}

          {company?.custom_fields?.payment2 && (
            <CustomField
              field="payment2"
              defaultValue={payment?.custom_value2}
              value={company?.custom_fields?.payment2}
              onChange={(value) =>
                handleChange('custom_value2', value.toString())
              }
            />
          )}

          {company?.custom_fields?.payment3 && (
            <CustomField
              field="payment3"
              defaultValue={payment?.custom_value3}
              value={company?.custom_fields?.payment3}
              onChange={(value) =>
                handleChange('custom_value3', value.toString())
              }
            />
          )}

          {company?.custom_fields?.payment4 && (
            <CustomField
              field="payment4"
              defaultValue={payment?.custom_value4}
              value={company?.custom_fields?.payment4}
              onChange={(value) =>
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
