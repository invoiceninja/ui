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

const stringOperators = [
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts_with' },
  { value: 'is', label: 'is' },
  { value: 'is_empty', label: 'is_empty' },
];

const numberOperators = [
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: '=', label: '=' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
  ];

const OPERATORS = {
  description: stringOperators,
  participant: stringOperators,
  participant_name: stringOperators,
  amount: numberOperators,
};

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

    const matches = ['description', 'participant', 'participant_name'].includes(value);
    if (matches) handleChangeRule('operator', 'contains');

    if (value === 'amount') {
      handleChangeRule('operator', '<');
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
    if (transactionRule) {
      if (ruleIndex > -1) {
        setRule(transactionRule.rules[ruleIndex]);
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
        <option value="participant">{t('participant')}</option>
        <option value="participant_name">{t('participant_name')}</option>
      </SelectField>

      <SelectField
        required
        label={t('operator')}
        value={rule?.operator}
        onValueChange={(value) => handleChangeRule('operator', value)}
        customSelector
        dismissable={false}
      >
        {rule?.search_key &&
          OPERATORS[rule.search_key as keyof typeof OPERATORS]?.map(
            (operator, index) => (
              <option key={index} value={operator.value}>
                {t(operator.label)}
              </option>
            )
          )}
      </SelectField>

      {appliesTo === 'CREDIT' ? (
        <SelectField
          required
          label={t('value')}
          value={rule?.value}
          onValueChange={(value) => handleChangeRule('value', value)}
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
        rule?.operator !== 'is_empty' && (
          <InputField
            changeOverride={true}
            required
            label={t('value')}
            value={rule?.value}
            onValueChange={(value) => handleChangeRule('value', value)}
          />
        )
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
