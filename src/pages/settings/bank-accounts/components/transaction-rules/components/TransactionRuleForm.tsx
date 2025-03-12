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
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { TransactionRule } from '$app/common/interfaces/transaction-rules';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ExpenseCategorySelector } from '$app/components/expense-categories/ExpenseCategorySelector';
import Toggle from '$app/components/forms/Toggle';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';
import { useHandleChange } from '../hooks/useHandleChange';
import { RuleModal } from './RuleModal';
import { useColorScheme } from '$app/common/colors';

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
  const colors = useColorScheme();

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
            style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}
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
            style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}
            checked={transactionRule.matches_on_all || false}
            onValueChange={(value) => handleChange('matches_on_all', value)}
          />
        </Element>

        <Element
          leftSide={t('auto_convert')}
          leftSideHelp={t('auto_convert_help')}
        >
          <Toggle
            style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}

            checked={transactionRule.auto_convert || false}
            onValueChange={(value) => handleChange('auto_convert', value)}
          />
        </Element>

        <Element leftSide={t('vendor')}>
          <VendorSelector
            value={transactionRule.vendor_id}
            onChange={(vendor) => handleChange('vendor_id', vendor.id)}
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
              <Td width="30%" style={{ backgroundColor: colors.$2, color: colors.$3, colorScheme: colors.$0 }}>{t(rule.search_key)}</Td>

              <Td width="30%" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>{t(rule.operator)}</Td>

              <Td width="40%" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
                <div className="flex justify-between">
                  <span>{rule.value}</span>

                  <div className="flex space-x-8" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
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

          <Tr style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
            <Td colSpan={100} style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
              <button
                style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}
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
