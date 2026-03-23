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
import { SelectField } from '$app/components/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { TransactionRule } from '$app/common/interfaces/transaction-rules';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ExpenseCategorySelector } from '$app/components/expense-categories/ExpenseCategorySelector';
import Toggle from '$app/components/forms/Toggle';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleChange } from '../hooks/useHandleChange';
import { useCreditRuleFields } from '../hooks/useCreditRuleFields';
import { RuleModal } from './RuleModal';
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';
import { Plus } from '$app/components/icons/Plus';
import { Pencil } from '$app/components/icons/Pencil';
import { Trash } from '$app/components/icons/Trash';

interface Props {
  transactionRule: TransactionRule;
  setTransactionRule: Dispatch<SetStateAction<TransactionRule | undefined>>;
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  page?: 'create' | 'edit';
}

const AddRuleButton = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function TransactionRuleForm({
  transactionRule,
  setTransactionRule,
  errors,
  setErrors,
  page,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [ruleIndex, setRuleIndex] = useState<number>(-1);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);

  const creditFields = useCreditRuleFields();
  const creditKeyMap = Object.fromEntries(creditFields.map((f) => [f.key, f]));

  const handleChange = useHandleChange({ setErrors, setTransactionRule });

  const OPERATOR_LABELS: Record<string, string> = useMemo(
    () => ({
      is: t('is'),
      contains: t('contains'),
      starts_with: t('starts_with'),
      is_empty: t('is_empty'),
      '=': '=',
      '>': '>',
      '>=': '>=',
      '<': '<',
      '<=': '<=',
    }),
    []
  );

  const handleRemoveRule = (index: number) => {
    const updatedRulesList = transactionRule.rules.filter(
      (_, i) => i !== index
    );

    handleChange('rules', updatedRulesList);
  };

  const getOperatorLabel = (operator: string) => {
    if (OPERATOR_LABELS[operator]) {
      return OPERATOR_LABELS[operator];
    }

    return t(operator);
  };

  const getValueLabel = (value: string) => {
    if (creditKeyMap[value]) {
      return creditKeyMap[value].label;
    }

    return value;
  };

  return (
    <>
      <Card
        title={
          page === 'create'
            ? t('new_transaction_rule')
            : t('edit_transaction_rule')
        }
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <Element leftSide={t('name')} required>
          <InputField
            required
            value={transactionRule.name}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors.name}
          />
        </Element>

        <Element leftSide={t('applies_to')}>
          <SelectField
            value={transactionRule.applies_to || 'DEBIT'}
            onValueChange={(value) => {
              handleChange('applies_to', value as 'DEBIT' | 'CREDIT');

              if (value === 'CREDIT') {
                handleChange('vendor_id', '');
                handleChange('category_id', '');
              }
            }}
            errorMessage={errors?.errors.applies_to}
            customSelector
            searchable={false}
            dismissable={false}
          >
            <option value="DEBIT">{t('debit')}</option>
            <option value="CREDIT">{t('credit')}</option>
          </SelectField>
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
          leftSideHelp={
            transactionRule.applies_to === 'CREDIT'
              ? t('auto_convert_credit_help')
              : t('auto_convert_help')
          }
        >
          <Toggle
            checked={transactionRule.auto_convert || false}
            onValueChange={(value) => handleChange('auto_convert', value)}
          />
        </Element>

        {transactionRule.applies_to !== 'CREDIT' && (
          <>
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
          </>
        )}
      </Card>

      <Table>
        <Thead>
          <Th key="field">{t('field')}</Th>
          <Th key="operator">{t('operator')}</Th>
          <Th key="value">{t('value')}</Th>
        </Thead>

        <Tbody>
          {transactionRule.rules?.map((rule, index) => (
            <Tr
              key={index}
              className="py-2 border-b"
              style={{ borderColor: colors.$20 }}
            >
              <Td width="30%">{t(rule.search_key)}</Td>

              <Td width="30%">{getOperatorLabel(rule.operator)}</Td>

              <Td width="40%">
                <div className="flex justify-between items-center">
                  <span>
                    {rule.operator === 'is_empty'
                      ? '—'
                      : getValueLabel(rule.value)}
                  </span>

                  <div className="flex space-x-6">
                    <div
                      className="cursor-pointer hover:opacity-75"
                      onClick={() => {
                        setRuleIndex(index);
                        setIsRuleModalOpen(true);
                      }}
                    >
                      <Pencil color="#2176FF" size="1.2rem" />
                    </div>

                    <div
                      className="cursor-pointer hover:opacity-75"
                      onClick={() => handleRemoveRule(index)}
                    >
                      <Trash color="#ef4444" size="1.2rem" />
                    </div>
                  </div>
                </div>
              </Td>
            </Tr>
          ))}

          <Tr>
            <Td colSpan={100} className="p-1" withoutPadding>
              <AddRuleButton
                className="w-full py-2 inline-flex justify-center items-center space-x-2 rounded-[0.1875rem] cursor-pointer"
                onClick={() => {
                  setRuleIndex(-1);
                  setIsRuleModalOpen(true);
                }}
                theme={{
                  backgroundColor: colors.$1,
                  hoverBackgroundColor: colors.$20,
                }}
              >
                <Plus color={colors.$3} size="1rem" />
                <span>{t('add_rule')}</span>
              </AddRuleButton>
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
        appliesTo={
          (transactionRule.applies_to || 'DEBIT') as 'DEBIT' | 'CREDIT'
        }
      />
    </>
  );
}
