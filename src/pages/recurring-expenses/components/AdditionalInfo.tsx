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
import { CurrencySelector } from 'components/CurrencySelector';
import Toggle from 'components/forms/Toggle';
import { PaymentTypeSelector } from 'components/payment-types/PaymentTypeSelector';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RecurringExpenseCardProps } from './Details';

export function AdditionalInfo(props: RecurringExpenseCardProps) {
  const [t] = useTranslation();

  const { recurringExpense, handleChange } = props;

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

  const isConvertCurrency = () => {
    return (
      Boolean(recurringExpense?.exchange_rate) ||
      Boolean(recurringExpense?.foreign_amount)
    );
  };

  const onConvertCurrency = (checked: boolean) => {
    if (!checked) {
      handleChange('invoice_currency_id', '');
      handleChange('exchange_rate', 0);
      handleChange('foreign_amount', 0);

      return;
    }

    handleChange('exchange_rate', 1);
    handleChange('foreign_amount', recurringExpense!.amount);
  };

  useEffect(() => {
    if (isConvertCurrency()) {
      handleChange(
        'foreign_amount',
        recurringExpense!.amount * recurringExpense!.exchange_rate
      );
    }
  }, [recurringExpense?.amount]);

  const onExchangeRateChange = (rate: string) => {
    handleChange('exchange_rate', parseFloat(rate) || 1);
    handleChange(
      'foreign_amount',
      recurringExpense!.amount * parseFloat(rate) || 1
    );
  };

  const onConvertedAmountChange = (amount: string) => {
    handleChange(
      'foreign_amount',
      parseFloat(amount) || recurringExpense!.amount
    );
    handleChange(
      'exchange_rate',
      parseFloat(amount) / recurringExpense!.amount
    );
  };

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
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('mark_paid')} leftSideHelp={t('mark_paid_help')}>
          <Toggle checked={isMarkPaid()} onChange={onMarkPaid} />
        </Element>
      )}

      {recurringExpense && isMarkPaid() && (
        <Element leftSide={t('payment_type')}>
          <PaymentTypeSelector
            value={recurringExpense.payment_type_id}
            onChange={(id) => handleChange('payment_type_id', id)}
          />
        </Element>
      )}

      {recurringExpense && isMarkPaid() && (
        <Element leftSide={t('date')}>
          <InputField
            type="date"
            value={recurringExpense.payment_date}
            onValueChange={(date) => handleChange('payment_date', date)}
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
          />
        </Element>
      )}

      {recurringExpense && (
        <Element
          leftSide={t('convert_currency')}
          leftSideHelp={t('convert_currency_help')}
        >
          <Toggle checked={isConvertCurrency()} onChange={onConvertCurrency} />
        </Element>
      )}

      {recurringExpense && isConvertCurrency() && (
        <Element leftSide={t('currency')}>
          <CurrencySelector
            value={recurringExpense.invoice_currency_id}
            onChange={(id) => handleChange('invoice_currency_id', id)}
          />
        </Element>
      )}

      {recurringExpense && isConvertCurrency() && (
        <Element leftSide={t('exchange_rate')}>
          <InputField
            value={recurringExpense.exchange_rate}
            onValueChange={onExchangeRateChange}
          />
        </Element>
      )}

      {recurringExpense && isConvertCurrency() && (
        <Element leftSide={t('converted_amount')}>
          <InputField
            value={recurringExpense.foreign_amount}
            onValueChange={onConvertedAmountChange}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element
          leftSide={t('add_documents_to_invoice')}
          leftSideHelp={t('add_documents_to_invoice_help')}
        >
          <Toggle
            checked={recurringExpense.invoice_documents}
            onChange={(value) => handleChange('invoice_documents', value)}
          />
        </Element>
      )}
    </Card>
  );
}
