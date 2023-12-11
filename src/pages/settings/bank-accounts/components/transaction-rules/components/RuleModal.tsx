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

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  transactionRule: TransactionRule;
  setTransactionRule: Dispatch<SetStateAction<TransactionRule | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  ruleIndex: number;
}

const OPERATORS = {
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

export function RuleModal(props: Props) {
  const [t] = useTranslation();

  const {
    visible,
    setVisible,
    transactionRule,
    ruleIndex,
    setTransactionRule,
    setErrors,
  } = props;

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

    if (value === 'description') {
      handleChangeRule('operator', 'contains');
    }

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
  }, [transactionRule, ruleIndex]);

  return (
    <Modal
      title={ruleIndex > -1 ? t('edit_rule') : t('add_rule')}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <SelectField
        required
        label={t('field')}
        value={rule?.search_key}
        onValueChange={(value) => handleChangeRuleField(value)}
      >
        <option defaultChecked value="description">
          {t('description')}
        </option>
        <option value="amount">{t('amount')}</option>
      </SelectField>

      <SelectField
        required
        label={t('operator')}
        value={rule?.operator}
        onValueChange={(value) => handleChangeRule('operator', value)}
      >
        {rule?.search_key &&
          OPERATORS[rule.search_key as keyof typeof OPERATORS].map(
            (operator, index) => (
              <option key={index} value={operator.value}>
                {t(operator.label)}
              </option>
            )
          )}
      </SelectField>

      <InputField
        changeOverride={true}
        required
        label={t('value')}
        value={rule?.value}
        onValueChange={(value) => handleChangeRule('value', value)}
      />

      <Button
        className="self-end"
        onClick={handleAddRule}
        disableWithoutIcon
        disabled={!rule?.value}
      >
        {t('save')}
      </Button>
    </Modal>
  );
}
