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
import { useHandleChange } from '../hooks/useHandleChange';
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
            <Tr
              key={index}
              className="py-2 border-b"
              style={{
                borderColor: colors.$20,
              }}
            >
              <Td width="30%">{t(rule.search_key)}</Td>

              <Td width="30%">{t(rule.operator)}</Td>

              <Td width="40%">
                <div className="flex justify-between">
                  <span>{rule.value}</span>

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
      />
    </>
  );
}
