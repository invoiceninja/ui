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
import { InputField } from '$app/components/forms';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { DecimalInputSeparators } from '$app/common/interfaces/decimal-number-input-separators';
import { CurrencySelector } from '$app/components/CurrencySelector';
import Toggle from '$app/components/forms/Toggle';
import { PaymentTypeSelector } from '$app/components/payment-types/PaymentTypeSelector';
import dayjs from 'dayjs';
import { useResolveCurrencySeparator } from '$app/pages/transactions/common/hooks/useResolveCurrencySeparator';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { RecurringExpenseCardProps } from './Details';
import { NumberInputField } from '$app/components/forms/NumberInputField';

export function AdditionalInfo(props: RecurringExpenseCardProps) {
  const [t] = useTranslation();
  const { recurringExpense, handleChange, errors } = props;

  const company = useCurrentCompany();
  const reactSettings = useReactSettings();

  const resolveCurrency = useResolveCurrency();
  const resolveCurrencySeparator = useResolveCurrencySeparator();

  const [currencySeparators, setCurrencySeparators] =
    useState<DecimalInputSeparators>({
      decimalSeparator: ',',
      precision: 2,
      thousandSeparator: '.',
    });

  const [convertCurrency, setConvertCurrency] = useState<boolean>();

  const isMarkPaid = () => {
    return (
      Boolean(recurringExpense?.payment_type_id) ||
      Boolean(recurringExpense?.payment_date) ||
      Boolean(recurringExpense?.transaction_reference)
    );
  };

  const onMarkPaid = (checked: boolean) => {
    if (!checked) {
      handleChange('payment_date', '');
      handleChange('payment_type_id', '');
      handleChange('transaction_reference', '');

      return;
    }

    handleChange('payment_date', dayjs().format('YYYY-MM-DD'));
  };

  const onConvertedAmountChange = (value: number) => {
    if (recurringExpense && value) {
      handleChange('foreign_amount', value);

      if (recurringExpense.amount) {
        handleChange('exchange_rate', value / recurringExpense.amount);
      }
    } else {
      handleChange('foreign_amount', 0);
    }
  };

  useEffect(() => {
    if (
      recurringExpense &&
      recurringExpense.exchange_rate &&
      recurringExpense.invoice_currency_id
    ) {
      handleChange(
        'foreign_amount',
        recurringExpense.amount * recurringExpense.exchange_rate
      );
    } else {
      handleChange('foreign_amount', 0);
    }
  }, [recurringExpense?.amount]);

  useEffect(() => {
    if (recurringExpense) {
      handleChange('invoice_currency_id', recurringExpense.invoice_currency_id);

      if (
        recurringExpense.invoice_currency_id &&
        recurringExpense?.currency_id
      ) {
        const resolveConvertCurrency = resolveCurrency(
          recurringExpense.invoice_currency_id
        );
        const recurringExpenseCurrency = resolveCurrency(
          recurringExpense.currency_id
        );

        if (resolveConvertCurrency && recurringExpenseCurrency) {
          const currentExchangeRate =
            resolveConvertCurrency.exchange_rate /
            recurringExpenseCurrency.exchange_rate;

          handleChange('exchange_rate', currentExchangeRate);
        }
      } else {
        handleChange('foreign_amount', 0);
        handleChange('exchange_rate', 1);
      }
    } else {
      handleChange('foreign_amount', 0);
      handleChange('exchange_rate', 1);
    }

    if (recurringExpense?.invoice_currency_id) {
      const resolvedCurrencySeparators = resolveCurrencySeparator(
        recurringExpense.invoice_currency_id
      );

      if (resolvedCurrencySeparators) {
        setCurrencySeparators(resolvedCurrencySeparators);
      }
    }
  }, [recurringExpense?.invoice_currency_id, recurringExpense?.currency_id]);

  useEffect(() => {
    if (recurringExpense && recurringExpense.exchange_rate) {
      if (recurringExpense.amount && recurringExpense.invoice_currency_id) {
        handleChange(
          'foreign_amount',
          recurringExpense.amount * recurringExpense.exchange_rate
        );
      }
    } else {
      handleChange('exchange_rate', 1);
      handleChange('foreign_amount', 0);
    }
  }, [recurringExpense?.exchange_rate]);

  useEffect(() => {
    if (recurringExpense && typeof convertCurrency === 'undefined') {
      setConvertCurrency(
        Boolean(company?.convert_expense_currency) ||
          Boolean(recurringExpense?.foreign_amount)
      );
    }
  }, [recurringExpense]);

  return (
    <Card title={t('additional_info')} isLoading={!recurringExpense}>
      {recurringExpense && (
        <Element
          leftSide={t('should_be_invoiced')}
          leftSideHelp={t('mark_invoiceable_help')}
        >
          <Toggle
            checked={recurringExpense.should_be_invoiced}
            onChange={(value) => handleChange('should_be_invoiced', value)}
            cypressRef="shouldBeInvoicedToggle"
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('mark_paid')} leftSideHelp={t('mark_paid_help')}>
          <Toggle
            checked={isMarkPaid()}
            onChange={onMarkPaid}
            cypressRef="markPaidToggle"
          />
        </Element>
      )}

      {recurringExpense && isMarkPaid() && (
        <Element leftSide={t('payment_type')}>
          <PaymentTypeSelector
            value={recurringExpense.payment_type_id}
            onChange={(id) => handleChange('payment_type_id', id)}
            errorMessage={errors?.errors.payment_type_id}
          />
        </Element>
      )}

      {recurringExpense && isMarkPaid() && (
        <Element leftSide={t('date')}>
          <InputField
            type="date"
            value={recurringExpense.payment_date}
            onValueChange={(date) => handleChange('payment_date', date)}
            errorMessage={errors?.errors.payment_date}
          />
        </Element>
      )}

      {recurringExpense && isMarkPaid() && (
        <Element leftSide={t('transaction_reference')}>
          <InputField
            value={recurringExpense.transaction_reference}
            onValueChange={(date) =>
              handleChange('transaction_reference', date)
            }
            errorMessage={errors?.errors.transaction_reference}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element
          leftSide={t('convert_currency')}
          leftSideHelp={t('convert_expense_currency_help')}
        >
          <Toggle
            checked={convertCurrency || false}
            onChange={(value: boolean) => setConvertCurrency(value)}
            cypressRef="convertCurrencyToggle"
          />
        </Element>
      )}

      {recurringExpense && convertCurrency && (
        <>
          <Element leftSide={t('currency')}>
            <CurrencySelector
              value={recurringExpense.invoice_currency_id}
              onChange={(id) => handleChange('invoice_currency_id', id)}
              dismissable
              errorMessage={errors?.errors.invoice_currency_id}
            />
          </Element>

          <Element leftSide={t('exchange_rate')}>
            <NumberInputField
              value={recurringExpense.exchange_rate || ''}
              onValueChange={(value) =>
                handleChange('exchange_rate', parseFloat(value))
              }
              errorMessage={errors?.errors.exchange_rate}
              disablePrecision
            />
          </Element>

          <Element leftSide={t('converted_amount')}>
            <NumberInputField
              border
              precision={
                reactSettings?.number_precision &&
                reactSettings?.number_precision > 0 &&
                reactSettings?.number_precision <= 100
                  ? reactSettings.number_precision
                  : currencySeparators?.precision || 2
              }
              className="auto"
              value={(recurringExpense.foreign_amount || 0).toString()}
              onValueChange={(value: string) =>
                onConvertedAmountChange(parseFloat(value))
              }
              errorMessage={errors?.errors.foreign_amount}
              disablePrecision
            />
          </Element>
        </>
      )}

      {recurringExpense && (
        <Element
          leftSide={t('add_documents_to_invoice')}
          leftSideHelp={t('add_documents_to_invoice_help')}
        >
          <Toggle
            checked={recurringExpense.invoice_documents}
            onChange={(value) => handleChange('invoice_documents', value)}
            cypressRef="addDocumentsToInvoiceToggle"
          />
        </Element>
      )}
    </Card>
  );
}
