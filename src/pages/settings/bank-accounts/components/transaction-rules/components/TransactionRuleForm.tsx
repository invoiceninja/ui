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
import { Table, Tbody, Td, Th, Thead, Tr } from '@invoiceninja/tables';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { TransactionRule } from 'common/interfaces/transaction-rules';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ExpenseCategorySelector } from 'components/expense-categories/ExpenseCategorySelector';
import Toggle from 'components/forms/Toggle';
import { VendorSelector } from 'components/vendors/VendorSelector';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';
import { useHandleChange } from '../hooks/useHandleChange';
import { RuleModal } from './RuleModal';

interface Props {
  transactionRule: TransactionRule;
  setTransactionRule: Dispatch<SetStateAction<TransactionRule | undefined>>;
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  page?: 'create' | 'edit';
}

export function TransactionRuleForm(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [ruleIndex, setRuleIndex] = useState<number>(-1);

  const { transactionRule, setTransactionRule, errors, setErrors } = props;

  const handleChange = useHandleChange({ setErrors, setTransactionRule });

  const handleRemoveRule = (ruleIndex: number) => {
    const updatedRulesList = transactionRule.rules.filter(
      (rule, index) => index !== ruleIndex
    );

    handleChange('rules', updatedRulesList);
  };

  return (
    <>
      <Card
        title={
          props.page === 'create'
            ? t('new_transaction_rule')
            : t('edit_transaction_rule')
        }
      >
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

      <Table>
        <Thead>
          <Th key="field">{t('field')}</Th>
          <Th key="operator">{t('operator')}</Th>
          <Th key="value">{t('value')}</Th>
        </Thead>

        <Tbody>
          {transactionRule.rules?.map((rule, index) => (
            <Tr key={index} className="py-2">
              <Td width="30%">{t(rule.search_key)}</Td>

              <Td width="30%">{t(rule.operator)}</Td>

              <Td width="40%">
                <div className="flex justify-between">
                  <span>{rule.value}</span>

                  <div className="flex space-x-8">
                    <MdEdit
                      className="cursor-pointer"
                      color={accentColor}
                      fontSize={22}
                      onClick={() => {
                        setRuleIndex(index);
                        setIsRuleModalOpen(true);
                      }}
                    />

                    <MdDelete
                      className="cursor-pointer"
                      color={accentColor}
                      fontSize={22}
                      onClick={() => handleRemoveRule(index)}
                    />
                  </div>
                </div>
              </Td>
            </Tr>
          ))}

          <Tr className="bg-slate-100 hover:bg-slate-200">
            <Td colSpan={100}>
              <button
                onClick={() => {
                  setRuleIndex(-1);
                  setIsRuleModalOpen(true);
                }}
                className="w-full py-1 inline-flex justify-center items-center space-x-2"
              >
                <MdAdd
                  className="cursor-pointer"
                  color={accentColor}
                  fontSize={18}
                />

                <span>{t('add_rule')}</span>
              </button>
            </Td>
          </Tr>
        </Tbody>
      </Table>

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
