/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { transactionTypes } from '$app/common/constants/transactions';
import { DecimalNumberInput } from '$app/components/forms/DecimalNumberInput';
import {
  ApiTransactionType,
  TransactionType,
} from '$app/common/enums/transactions';
import { BankAccountSelector } from '../components/BankAccountSelector';
import { Transaction } from '$app/common/interfaces/transactions';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTranslation } from 'react-i18next';
import { DecimalInputSeparators } from '$app/common/interfaces/decimal-number-input-separators';
import { EntityStatus } from './EntityStatus';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { useColorScheme } from '$app/common/colors';

interface Props {
  transaction: Transaction;
  handleChange: (
    property: keyof Transaction,
    value: Transaction[keyof Transaction]
  ) => void;
  errors: ValidationBag | undefined;
  currencySeparators: DecimalInputSeparators;
  page?: 'create' | 'edit';
}

export function TransactionForm(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  return (
    <>
      {props.page === 'edit' && (
        <Element leftSide={t('status')}>
          <EntityStatus transaction={props.transaction} />
        </Element>
      )}

      <Element required leftSide={t('type')}>
        <SelectField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          value={
            props.transaction.base_type === ApiTransactionType.Credit
              ? TransactionType.Deposit
              : TransactionType.Withdrawal
          }
          onValueChange={(value) =>
            props.handleChange(
              'base_type',
              value === TransactionType.Deposit
                ? ApiTransactionType.Credit
                : ApiTransactionType.Debit
            )
          }
          errorMessage={props.errors?.errors.base_type}
          cypressRef="transactionTypeSelector"
        >
          {Object.values(transactionTypes).map((transactionType) => (
            <option key={transactionType} value={transactionType}>
              {t(transactionType)}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('date')}>
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          type="date"
          value={props.transaction.date}
          onValueChange={(value) => props.handleChange('date', value)}
          errorMessage={props.errors?.errors.date}
        />
      </Element>

      <Element leftSide={t('amount')}>
        <DecimalNumberInput
          border
          precision={props.currencySeparators.precision}
          currency={props.currencySeparators}
          className="auto"
          initialValue={props.transaction.amount.toString()}
          value={props.transaction.amount.toString()}
          onChange={(value: string) =>
            props.handleChange('amount', Number(value))
          }
          errorMessage={props.errors?.errors.amount}
        />
      </Element>

      <Element required leftSide={t('currency')}>
        <CurrencySelector
          value={props.transaction.currency_id}
          onChange={(v) => props.handleChange('currency_id', v)}
          errorMessage={props.errors?.errors.currency_id}
        />
      </Element>

      <Element required leftSide={t('bank_account')}>
        <BankAccountSelector
          value={props.transaction.bank_integration_id}
          onChange={(account) =>
            props.handleChange('bank_integration_id', account.id)
          }
          onClearButtonClick={() =>
            props.handleChange('bank_integration_id', '')
          }
          errorMessage={props.errors?.errors.bank_integration_id}
        />
      </Element>

      <Element leftSide={t('description')}>
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          element="textarea"
          value={props.transaction.description}
          onValueChange={(value) => props.handleChange('description', value)}
          errorMessage={props.errors?.errors.description}
        />
      </Element>

      {props.page === 'edit' && (
        <>
          {props.transaction.participant && (
            <Element leftSide={t('participant')}>
              <InputField value={props.transaction.participant} readOnly />
            </Element>
          )}

          {props.transaction.participant_name && (
            <Element leftSide={t('participant_name')}>
              <InputField value={props.transaction.participant_name} readOnly />
            </Element>
          )}
        </>
      )}
    </>
  );
}
