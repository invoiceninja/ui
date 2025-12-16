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
import { InputField, InputLabel, SelectField } from '$app/components/forms';
import collect from 'collect.js';
import { useCreditResolver } from '$app/common/hooks/credits/useCreditResolver';
import { useInvoiceResolver } from '$app/common/hooks/invoices/useInvoiceResolver';
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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useSave } from './hooks/useSave';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { useAtom } from 'jotai';
import { paymentAtom } from '../common/atoms';
import { usePaymentTypes } from '$app/common/hooks/usePaymentTypes';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { Banner } from '$app/components/Banner';
import { useColorScheme } from '$app/common/colors';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { DataTable } from '$app/components/DataTable';
import { useApplyInvoiceTableColumns } from '../common/hooks/useApplyInvoiceTableColumns';
import { useCreditColumns } from './hooks/useCreditColumns';
import { TableTotalFooter } from './components/TableTotalFooter';

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

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const creditResolver = useCreditResolver();
  const invoiceResolver = useInvoiceResolver();

  const paymentTypes = usePaymentTypes();

  const [payment, setPayment] = useAtom(paymentAtom);
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [sendEmail, setSendEmail] = useState(
    company?.settings?.client_manual_payment_notification
  );
  const [convertCurrency, setConvertCurrency] = useState(false);

  const [initialEndpoints, setInitialEndpoints] = useState<{
    invoices: string;
    credits: string;
  }>({
    invoices: '',
    credits: '',
  });

  const { data: blankPayment } = useBlankPaymentQuery();

  const creditColumns = useCreditColumns({
    payment,
    setPayment,
    errors,
  });
  const invoiceColumns = useApplyInvoiceTableColumns({
    payment,
    setPayment,
    errors,
  });

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
    if (
      payment?.client_id &&
      (searchParams.get('client') === payment?.client_id ||
        !searchParams.get('client'))
    ) {
      setInitialEndpoints({
        invoices: `/api/v1/invoices?include=client&payable=${
          payment?.client_id
        }&per_page=100&sort=date|desc&per_page=1000${
          searchParams.get('invoice')
            ? `&with=${searchParams.get('invoice')}`
            : ''
        }`,
        credits: `/api/v1/credits?include=client&client_id=${
          payment?.client_id
        }&per_page=100&applicable=true${
          searchParams.get('credit')
            ? `&with=${searchParams.get('credit')}`
            : ''
        }`,
      });
    }
  }, [payment?.client_id, searchParams]);

  useEffect(() => {
    return () => {
      setInitialEndpoints({
        invoices: '',
        credits: '',
      });

      setPayment(undefined);
    };
  }, []);

  const handleChange = <
    TField extends keyof PaymentOnCreation,
    TValue extends PaymentOnCreation[TField]
  >(
    field: TField,
    value: TValue
  ) => {
    setPayment((current) => current && { ...current, [field]: value });
  };

  const onSubmit = useSave({ setErrors, setIsFormBusy, isFormBusy });

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => onSubmit(payment as unknown as Payment, sendEmail)}
      disableSaveButton={!payment || isFormBusy}
      aboveMainContainer={
        Boolean(payment && payment.amount < 0) && (
          <Banner variant="orange" style={{ borderColor: colors.$5 }}>
            {t('negative_payment_warning')}
          </Banner>
        )
      }
    >
      <Container breadcrumbs={[]}>
        <Card
          title={t('enter_payment')}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <Element leftSide={t('client')}>
            <ClientSelector
              onChange={(client) => {
                setInitialEndpoints({
                  invoices: '',
                  credits: '',
                });

                setTimeout(() => {
                  handleChange('client_id', client?.id as string);
                  handleChange(
                    'currency_id',
                    client?.settings.currency_id || '1'
                  );
                  handleChange('invoices', []);
                  handleChange('credits', []);
                }, 25);
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
            <NumberInputField
              value={payment?.amount || ''}
              onValueChange={(value) =>
                handleChange(
                  'amount',
                  isNaN(parseFloat(value)) ? 0 : parseFloat(value)
                )
              }
              errorMessage={errors?.errors.amount}
              changeOverride
            />
          </Element>

          {payment?.client_id && <Divider />}

          {payment?.client_id && initialEndpoints.invoices && (
            <div className="block px-4 sm:px-6 mt-4">
              <DataTable<Invoice>
                resource="invoice"
                queryIdentificator="/api/v1/invoices"
                endpoint={initialEndpoints.invoices}
                columns={invoiceColumns}
                onSelectedResourcesChange={(selectedResources) => {
                  if (selectedResources.length > 0) {
                    const newInvoices: PaymentInvoice[] = [];

                    selectedResources.forEach((resource: Invoice) => {
                      const existingInvoice = payment?.invoices.find(
                        (pInvoice) => pInvoice.invoice_id === resource.id
                      );

                      newInvoices.push({
                        _id: v4(),
                        amount: existingInvoice
                          ? existingInvoice.amount
                          : resource.balance > 0
                          ? resource.balance
                          : resource.amount,
                        invoice_id: resource.id,
                      });
                    });

                    setPayment(
                      (current) =>
                        current && { ...current, invoices: newInvoices }
                    );
                  } else {
                    setPayment(
                      (current) => current && { ...current, invoices: [] }
                    );
                  }
                }}
                withoutPagination
                withoutStatusFilter
                withoutAllBulkActions
                preSelected={
                  searchParams.get('invoice')
                    ? [searchParams.get('invoice') as string]
                    : []
                }
                emptyState={
                  <div className="flex items-center justify-center pt-2">
                    <span className="text-sm" style={{ color: colors.$17 }}>
                      {t('no_invoices_found')}
                    </span>
                  </div>
                }
                beforeFilterInput={<InputLabel>{t('invoices')}</InputLabel>}
                styleOptions={{
                  withoutBottomBorder: Boolean(payment?.invoices.length),
                }}
                withoutBottomPadding={Boolean(payment?.invoices.length)}
                withoutBottomRounding={Boolean(payment?.invoices.length)}
              />

              <TableTotalFooter resource="invoice" payment={payment} />
            </div>
          )}

          {errors?.errors.invoices && (
            <div className="px-6">
              <ErrorMessage className="mt-2">
                {errors?.errors.invoices}
              </ErrorMessage>
            </div>
          )}

          {payment?.client_id && <Divider />}

          {payment?.client_id && initialEndpoints.credits && (
            <div className="block px-4 sm:px-6 mt-4">
              <DataTable<Credit>
                resource="credit"
                queryIdentificator="/api/v1/credits"
                endpoint={initialEndpoints.credits}
                columns={creditColumns}
                onSelectedResourcesChange={(selectedResources) => {
                  if (selectedResources.length > 0) {
                    const newCredits: PaymentCredit[] = [];

                    selectedResources.forEach((resource: Credit) => {
                      const existingCredit = payment?.credits.find(
                        (pCredit) => pCredit.credit_id === resource.id
                      );

                      newCredits.push({
                        _id: v4(),
                        amount: existingCredit
                          ? existingCredit.amount
                          : resource.balance > 0
                          ? resource.balance
                          : resource.amount,
                        credit_id: resource.id,
                      });
                    });

                    setPayment(
                      (current) =>
                        current && { ...current, credits: newCredits }
                    );
                  } else {
                    setPayment(
                      (current) => current && { ...current, credits: [] }
                    );
                  }
                }}
                withoutPagination
                withoutStatusFilter
                withoutAllBulkActions
                preSelected={
                  searchParams.get('credit')
                    ? [searchParams.get('credit') as string]
                    : []
                }
                emptyState={
                  <div className="flex items-center justify-center py-2">
                    <span className="text-sm" style={{ color: colors.$17 }}>
                      {t('no_credits_found')}
                    </span>
                  </div>
                }
                beforeFilterInput={<InputLabel>{t('credits')}</InputLabel>}
                styleOptions={{
                  withoutBottomBorder: Boolean(payment?.credits.length),
                }}
                withoutBottomPadding={Boolean(payment?.credits.length)}
                withoutBottomRounding={Boolean(payment?.credits.length)}
              />

              <TableTotalFooter resource="credit" payment={payment} />
            </div>
          )}

          {errors?.errors.credits && (
            <div className="px-6">
              <ErrorMessage className="mt-2">
                {errors?.errors.credits}
              </ErrorMessage>
            </div>
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
              value={payment?.type_id}
              onValueChange={(value) => handleChange('type_id', value)}
              errorMessage={errors?.errors.type_id}
              withBlank
              customSelector
            >
              {paymentTypes.map(([key, value], index) => (
                <option value={key} key={index}>
                  {value}
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

                if (!value) handleChange('exchange_currency_id', '');
                else handleChange('exchange_currency_id', '1');

                handleChange('exchange_rate', 1);
              }}
            />
          </Element>

          {convertCurrency && payment && (
            <ConvertCurrency
              exchangeRate={payment.exchange_rate.toString() || '1'}
              exchangeCurrencyId={payment.exchange_currency_id}
              currencyId={payment.currency_id || '1'}
              amount={
                (collect(payment?.invoices).sum('amount') as number) +
                (payment?.amount ?? 0)
              }
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
