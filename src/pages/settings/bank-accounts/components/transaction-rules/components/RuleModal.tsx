/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField, SelectField } from '$app/components/forms';
import { defaultRule } from '$app/common/constants/rules';
import {
  Rule,
  TransactionRule,
} from '$app/common/interfaces/transaction-rules';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleChange } from '../hooks/useHandleChange';
import { useCreditRuleFields } from '../hooks/useCreditRuleFields';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  transactionRule: TransactionRule;
  setTransactionRule: Dispatch<SetStateAction<TransactionRule | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  ruleIndex: number;
  appliesTo: 'DEBIT' | 'CREDIT';
}

const DEBIT_OPERATORS = {
  description: [
    { value: 'contains', label: 'contains' },
    { value: 'starts_with', label: 'starts_with' },
    { value: 'is', label: 'is' },
    { value: 'is_empty', label: 'is_empty' },
  ],
  amount: [
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: '=', label: '=' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
  ],
};

const STRING_OPERATORS = [
  { value: 'is', label: 'is' },
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts_with' },
  { value: 'is_empty', label: 'is_empty' },
];

const NUMBER_OPERATORS = [
  { value: '=', label: '=' },
  { value: '>', label: '>' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '<=', label: '<=' },
];

export function RuleModal({
  visible,
  setVisible,
  transactionRule,
  ruleIndex,
  setTransactionRule,
  setErrors,
  appliesTo,
}: Props) {
  const [t] = useTranslation();

  const creditFields = useCreditRuleFields();
  const creditKeyMap = Object.fromEntries(creditFields.map((f) => [f.key, f]));

  const getCreditFieldType = (searchKey: string) => {
    if (creditKeyMap[searchKey]) {
      return creditKeyMap[searchKey].type;
    }

    return 'string';
  };

  const getDefaultCreditOperator = (searchKey: string) => {
    if (getCreditFieldType(searchKey) === 'number') {
      return '=';
    }

    return 'is';
  };

  const getCreditOperators = (searchKey: string) => {
    if (getCreditFieldType(searchKey) === 'number') {
      return NUMBER_OPERATORS;
    }

    return STRING_OPERATORS;
  };

  const [rule, setRule] = useState<Rule>();

  const handleChange = useHandleChange({ setTransactionRule, setErrors });

  const handleChangeRule = (property: keyof Rule, value: Rule[keyof Rule]) => {
    setRule(
      (currentRule) =>
        currentRule && {
          ...currentRule,
          [property]: value,
        }
    );
  };

  const handleChangeRuleField = (value: string) => {
    handleChangeRule('search_key', value);

    if (appliesTo === 'DEBIT') {
      if (value === 'description') handleChangeRule('operator', 'contains');
      if (value === 'amount') handleChangeRule('operator', '<');
    } else {
      handleChangeRule('operator', getDefaultCreditOperator(value));
      handleChangeRule('value', '');
    }
  };

  const handleAddRule = () => {
    if (rule) {
      const alreadyAddedRules = transactionRule.rules || [];

      if (ruleIndex > -1) {
        alreadyAddedRules[ruleIndex] = rule;
        handleChange('rules', alreadyAddedRules);
        setVisible(false);
      } else {
        handleChange('rules', [...alreadyAddedRules, rule]);
        setVisible(false);
      }
    }
  };

  useEffect(() => {
    if (!transactionRule) return;

    if (ruleIndex > -1) {
      setRule(transactionRule.rules[ruleIndex]);
    } else {
      if (appliesTo === 'CREDIT') {
        const defaultKey = creditFields[0].key;
        setRule({
          search_key: defaultKey,
          operator: getDefaultCreditOperator(defaultKey),
          value: '',
        });
      } else {
        setRule(defaultRule);
      }
    }
  }, [transactionRule, ruleIndex, appliesTo]);

  return (
    <Modal
      title={ruleIndex > -1 ? t('edit_rule') : t('add_rule')}
      visible={visible}
      onClose={() => setVisible(false)}
      overflowVisible
    >
      {appliesTo === 'CREDIT' ? (
        <SelectField
          required
          label={t('field')}
          value={rule?.search_key}
          onValueChange={(value) => handleChangeRuleField(value)}
          customSelector
          dismissable={false}
        >
          {creditFields.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </SelectField>
      ) : (
        <SelectField
          required
          label={t('field')}
          value={rule?.search_key}
          onValueChange={(value) => handleChangeRuleField(value)}
          customSelector
          dismissable={false}
        >
          <option defaultChecked value="description">
            {t('description')}
          </option>
          <option value="amount">{t('amount')}</option>
        </SelectField>
      )}

      <SelectField
        required
        label={t('operator')}
        value={rule?.operator}
        onValueChange={(value) => handleChangeRule('operator', value)}
        customSelector
        dismissable={false}
      >
        {appliesTo === 'CREDIT' && rule?.search_key
          ? getCreditOperators(rule.search_key).map((op, index) => (
              <option key={index} value={op.value}>
                {t(op.label)}
              </option>
            ))
          : rule?.search_key &&
            DEBIT_OPERATORS[
              rule.search_key as keyof typeof DEBIT_OPERATORS
            ]?.map((operator, index) => (
              <option key={index} value={operator.value}>
                {t(operator.label)}
              </option>
            ))}
      </SelectField>

      {rule?.operator !== 'is_empty' && (
        <InputField
          changeOverride={true}
          required
          label={t('value')}
          value={rule?.value}
          type={
            appliesTo === 'CREDIT' &&
            rule?.search_key &&
            getCreditFieldType(rule.search_key) === 'number'
              ? 'number'
              : 'text'
          }
          onValueChange={(value) => handleChangeRule('value', value)}
        />
      )}

      <Button
        className="self-end"
        onClick={handleAddRule}
        disableWithoutIcon
        disabled={rule?.operator !== 'is_empty' && !rule?.value}
      >
        {t('save')}
      </Button>
    </Modal>
  );
}
