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
import { useAccentColor } from 'common/hooks/useAccentColor';
import { TransactionRule } from 'common/interfaces/transaction-rules';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ExpenseCategorySelector } from 'components/expense-categories/ExpenseCategorySelector';
import Toggle from 'components/forms/Toggle';
import { VendorSelector } from 'components/vendors/VendorSelector';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import { useHandleChange } from '../hooks/useHandleChange';
import { RuleModal } from './RuleModal';

interface Props {
  transactionRule: TransactionRule;
  setTransactionRule: Dispatch<SetStateAction<TransactionRule | undefined>>;
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function TransactionRuleForm(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [ruleIndex, setRuleIndex] = useState<number>(-1);

  const { transactionRule, setTransactionRule, errors, setErrors } = props;

  const handleChange = useHandleChange({ setErrors, setTransactionRule });

  return (
    <>
      <Card title={t('new_transaction_rule')}>
        <Element leftSide={t('name')} required>
          <InputField
            required
            value={transactionRule.name}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors.name}
          />
        </Element>

        <Element
          leftSide={t('match_all_rules')}
          leftSideHelp={t('match_all_rules_help')}
        >
          <Toggle
            checked={transactionRule.matches_on_all || false}
            onValueChange={(value) => handleChange('matches_on_all', value)}
          />
        </Element>

        <Element
          leftSide={t('auto_convert')}
          leftSideHelp={t('auto_convert_help')}
        >
          <Toggle
            checked={transactionRule.auto_convert || false}
            onValueChange={(value) => handleChange('auto_convert', value)}
          />
        </Element>
      </Card>

      <Card>
        <div className="flex pl-6">
          {transactionRule.rules?.length && (
            <div className="grid w-full grid-cols-4 text-gray-600">
              <span>{t('field')}</span>
              <span>{t('operator')}</span>
              <span>{t('value')}</span>

              {transactionRule.rules.map((rule, index) => (
                <div key={index}>
                  <span>{t(rule.field)}</span>
                  <span>{t(rule.operator)}</span>
                  <span>{rule.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Element leftSide={t('add_rule')}>
          <MdAdd
            className="cursor-pointer hover:bg-gray-100"
            color={accentColor}
            fontSize={26}
            onClick={() => {
              setRuleIndex(-1);
              setIsRuleModalOpen(true);
            }}
          />
        </Element>
      </Card>

      <Card>
        <Element leftSide={t('vendor')}>
          <VendorSelector
            value={transactionRule.vendor_id}
            onChange={(vendor) => handleChange('vendor_id', vendor.id)}
            clearButton={Boolean(transactionRule.vendor_id)}
            onClearButtonClick={() => handleChange('vendor_id', '')}
            errorMessage={errors?.errors.vendor_id}
          />
        </Element>

        <Element leftSide={t('expense_category')}>
          <ExpenseCategorySelector
            value={transactionRule.category_id}
            onChange={(expenseCategory) =>
              handleChange('category_id', expenseCategory.id)
            }
            clearButton={Boolean(transactionRule.category_id)}
            onClearButtonClick={() => handleChange('category_id', '')}
            errorMessage={errors?.errors.category_id}
          />
        </Element>
      </Card>

      <RuleModal
        visible={isRuleModalOpen}
        setVisible={setIsRuleModalOpen}
        ruleIndex={ruleIndex}
        setTransactionRule={setTransactionRule}
        setErrors={setErrors}
        transactionRule={transactionRule}
      />
    </>
  );
}
