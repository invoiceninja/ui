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
import { DecimalNumberInput } from '$app/components/forms/DecimalNumberInput';
import Toggle from '$app/components/forms/Toggle';
import { PaymentTypeSelector } from '$app/components/payment-types/PaymentTypeSelector';
import dayjs from 'dayjs';
import { useResolveCurrencySeparator } from '$app/pages/transactions/common/hooks/useResolveCurrencySeparator';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpenseCardProps } from './Details';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export function AdditionalInfo(props: ExpenseCardProps) {
  const [t] = useTranslation();
  const { expense, handleChange, errors } = props;

  const company = useCurrentCompany();
  const resolveCurrency = useResolveCurrency();
  const resolveCurrencySeparator = useResolveCurrencySeparator();
  const reactSettings = useReactSettings();

  const [currencySeparators, setCurrencySeparators] =
    useState<DecimalInputSeparators>({
      decimalSeparator: ',',
      precision: 2,
      thousandSeparator: '.',
    });

  const [convertCurrency, setConvertCurrency] = useState<boolean>();

  const isMarkPaid = () => {
    return (
      Boolean(expense?.payment_type_id) ||
      Boolean(expense?.payment_date) ||
      Boolean(expense?.transaction_reference)
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
    if (expense && value) {
      handleChange('foreign_amount', value);

      if (expense.amount) {
        handleChange('exchange_rate', value / expense.amount);
      }
    } else {
      handleChange('foreign_amount', 0);
    }
  };

  useEffect(() => {
    if (
      expense &&
      expense.exchange_rate &&
      expense.invoice_currency_id &&
      expense.currency_id
    ) {
      handleChange('foreign_amount', expense.amount * expense.exchange_rate);
    } else {
      handleChange('foreign_amount', 0);
    }
  }, [expense?.amount]);

  useEffect(() => {
    if (expense) {
      if (expense.currency_id) {
        handleChange('currency_id', expense.currency_id);
      } else {
        handleChange('invoice_currency_id', expense.invoice_currency_id);
      }

      if (expense.currency_id && expense.invoice_currency_id) {
        const resolveExpenseCurrency = resolveCurrency(expense.currency_id);
        const resolveConvertCurrency = resolveCurrency(
          expense.invoice_currency_id
        );

        if (resolveExpenseCurrency && resolveConvertCurrency) {
          handleChange(
            'exchange_rate',
            (1 / resolveExpenseCurrency?.exchange_rate) *
              resolveConvertCurrency?.exchange_rate
          );

          if (expense.amount) {
            handleChange(
              'foreign_amount',
              expense.amount * expense.exchange_rate
            );
          }
        }
      } else {
        handleChange('foreign_amount', 0);
        handleChange('exchange_rate', 1);
      }
    } else {
      handleChange('foreign_amount', 0);
      handleChange('exchange_rate', 1);
    }
  }, [expense?.currency_id, expense?.invoice_currency_id]);

  useEffect(() => {
    if (expense?.invoice_currency_id) {
      const resolvedCurrencySeparators = resolveCurrencySeparator(
        expense.invoice_currency_id
      );

      if (resolvedCurrencySeparators) {
        setCurrencySeparators(resolvedCurrencySeparators);
      }
    }
  }, [expense?.invoice_currency_id]);

  useEffect(() => {
    if (expense && expense.exchange_rate) {
      handleChange('exchange_rate', expense.exchange_rate);

      if (
        expense.amount &&
        expense.invoice_currency_id &&
        expense.currency_id
      ) {
        handleChange('foreign_amount', expense.amount * expense.exchange_rate);
      }
    } else {
      handleChange('exchange_rate', 1);
      handleChange('foreign_amount', 0);
    }
  }, [expense?.exchange_rate]);

  useEffect(() => {
    if (expense && typeof convertCurrency === 'undefined') {
      setConvertCurrency(
        Boolean(company?.convert_expense_currency) ||
          Boolean(expense?.foreign_amount)
      );
    }
  }, [expense]);

  return (
    <Card title={t('additional_info')} isLoading={!expense}>
      {expense && (
        <Element
          leftSide={t('should_be_invoiced')}
          leftSideHelp={t('mark_invoiceable_help')}
        >
          <Toggle
            checked={expense.should_be_invoiced}
            onChange={(value) => handleChange('should_be_invoiced', value)}
          />
        </Element>
      )}

      {expense && (
        <Element leftSide={t('mark_paid')} leftSideHelp={t('mark_paid_help')}>
          <Toggle checked={isMarkPaid()} onChange={onMarkPaid} />
        </Element>
      )}

      {expense && isMarkPaid() && (
        <Element leftSide={t('payment_type')}>
          <PaymentTypeSelector
            value={expense.payment_type_id}
            onChange={(id) => handleChange('payment_type_id', id)}
            errorMessage={errors?.errors.payment_type_id}
          />
        </Element>
      )}

      {expense && isMarkPaid() && (
        <Element leftSide={t('date')}>
          <InputField
            type="date"
            value={expense.payment_date}
            onValueChange={(date) => handleChange('payment_date', date)}
            errorMessage={errors?.errors.payment_date}
          />
        </Element>
      )}

      {expense && isMarkPaid() && (
        <Element leftSide={t('transaction_reference')}>
          <InputField
            value={expense.transaction_reference}
            onValueChange={(date) =>
              handleChange('transaction_reference', date)
            }
            errorMessage={errors?.errors.transaction_reference}
          />
        </Element>
      )}

      {expense && (
        <Element
          leftSide={t('convert_currency')}
          leftSideHelp={t('convert_expense_currency_help')}
        >
          <Toggle
            checked={convertCurrency || false}
            onChange={(value: boolean) => setConvertCurrency(value)}
          />
        </Element>
      )}

      {expense && convertCurrency && (
        <>
          <Element leftSide={t('currency')}>
            <CurrencySelector
              value={expense.invoice_currency_id}
              onChange={(id) => handleChange('invoice_currency_id', id)}
              errorMessage={errors?.errors.invoice_currency_id}
            />
          </Element>

          <Element leftSide={t('exchange_rate')}>
            <InputField
              value={expense.exchange_rate.toFixed(5)}
              onValueChange={(value) =>
                handleChange('exchange_rate', parseFloat(value))
              }
              errorMessage={errors?.errors.exchange_rate}
            />
          </Element>

          <Element leftSide={t('converted_amount')}>
            <DecimalNumberInput
              border
              precision={
                reactSettings?.number_precision &&
                reactSettings?.number_precision > 0
                  ? reactSettings.number_precision
                  : currencySeparators?.precision || 2
              }
              currency={currencySeparators}
              className="auto"
              initialValue={(expense.foreign_amount || 0).toString()}
              onChange={(value: string) =>
                onConvertedAmountChange(parseFloat(value))
              }
              errorMessage={errors?.errors.foreign_amount}
            />
          </Element>
        </>
      )}

      {expense && (
        <Element
          leftSide={t('add_documents_to_invoice')}
          leftSideHelp={t('add_documents_to_invoice_help')}
        >
          <Toggle
            checked={expense.invoice_documents}
            onChange={(value) => handleChange('invoice_documents', value)}
          />
        </Element>
      )}
    </Card>
  );
}
