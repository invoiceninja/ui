/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import { CurrencySelector } from 'components/CurrencySelector';
import { DecimalNumberInput } from 'components/forms/DecimalNumberInput';
import Toggle from 'components/forms/Toggle';
import { PaymentTypeSelector } from 'components/payment-types/PaymentTypeSelector';
import dayjs from 'dayjs';
import { useResolveCurrencySeparator } from 'pages/transactions/common/hooks/useResolveCurrencySeparator';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpenseCardProps } from './Details';

export function AdditionalInfo(props: ExpenseCardProps) {
  const [t] = useTranslation();
  const { expense, handleChange } = props;

  const company = useCurrentCompany();
  const resolveCurrency = useResolveCurrency();
  const resolveCurrencySeparator = useResolveCurrencySeparator();

  const [currencySeparators, setCurrencySeparators] =
    useState<DecimalInputSeparators>({
      decimalSeparator: ',',
      precision: 2,
      thousandSeparator: '.',
    });

  const [convertCurrency, setConvertCurrency] = useState<boolean>(
    Boolean(company?.convert_expense_currency)
  );

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

  const onAmountChange = () => {
    if (!currencySeparators) {
      handleChange('invoice_currency_id', '');
      handleChange('exchange_rate', 0);
      handleChange('foreign_amount', 0);

      return;
    }

    handleChange('exchange_rate', 1);
    handleChange('foreign_amount', expense!.amount);
  };

  const onExchangeRateChange = (rate: string) => {
    handleChange('exchange_rate', parseFloat(rate) || 1);
    handleChange('foreign_amount', expense!.amount * parseFloat(rate) || 1);
  };

  const onConvertedAmountChange = (amount: string) => {
    handleChange('foreign_amount', parseFloat(amount) || expense!.amount);
    handleChange('exchange_rate', parseFloat(amount) / expense!.amount);
  };

  useEffect(() => {
    if (company?.convert_expense_currency && expense) {
      handleChange('foreign_amount', expense.amount * expense.exchange_rate);

      onAmountChange();
    }
  }, [expense?.amount]);

  useEffect(() => {
    if (expense && expense.invoice_currency_id) {
      const resolvedCurrency = resolveCurrency(expense.invoice_currency_id);

      if (resolvedCurrency) {
        const resolvedCurrencySeparator = resolveCurrencySeparator(
          resolvedCurrency.id
        );

        if (resolvedCurrencySeparator) {
          setCurrencySeparators(resolvedCurrencySeparator);
          handleChange('exchange_rate', resolvedCurrency.exchange_rate);
          handleChange('foreign_amount', expense!.amount);
        }
      }
    } else {
      handleChange('invoice_currency_id', '');
      handleChange('exchange_rate', 1);
      handleChange('foreign_amount', 0);
    }
  }, [expense?.invoice_currency_id]);

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
          />
        </Element>
      )}

      {expense && isMarkPaid() && (
        <Element leftSide={t('date')}>
          <InputField
            type="date"
            value={expense.payment_date}
            onValueChange={(date) => handleChange('payment_date', date)}
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
          />
        </Element>
      )}

      {expense && company && (
        <Element
          leftSide={t('convert_currency')}
          leftSideHelp={t('convert_expense_currency_help')}
        >
          <Toggle
            checked={convertCurrency}
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
            />
          </Element>

          <Element leftSide={t('exchange_rate')}>
            <InputField
              value={expense.exchange_rate.toFixed(2)}
              onValueChange={(value) => onExchangeRateChange(value)}
            />
          </Element>

          <Element leftSide={t('converted_amount')}>
            <DecimalNumberInput
              border
              precision={currencySeparators?.precision || 2}
              currency={currencySeparators}
              className="auto"
              initialValue={(expense.foreign_amount || 0).toString()}
              onChange={onConvertedAmountChange}
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
