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
import { Expense } from 'common/interfaces/expense';
import { ClientSelector } from 'components/clients/ClientSelector';
import { CurrencySelector } from 'components/CurrencySelector';
import { ExpenseCategorySelector } from 'components/expense-categories/ExpenseCategorySelector';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { UserSelector } from 'components/users/UserSelector';
import { VendorSelector } from 'components/vendors/VendorSelector';
import { useTranslation } from 'react-i18next';

export interface ExpenseCardProps {
  expense: Expense | undefined;
  handleChange: <T extends keyof Expense>(
    property: T,
    value: Expense[T]
  ) => void;
}

export function Details(props: ExpenseCardProps) {
  const [t] = useTranslation();
  const { expense, handleChange } = props;

  return (
    <Card title={t('details')} isLoading={!expense}>
      {expense && (
        <Element leftSide={t('vendor')}>
          <VendorSelector
            value={expense.vendor_id}
            clearButton={Boolean(expense.vendor_id)}
            onClearButtonClick={() => handleChange('vendor_id', '')}
            onChange={(vendor) => handleChange('vendor_id', vendor.id)}
          />
        </Element>
      )}

      {expense && (
        <Element leftSide={t('client')}>
          <ClientSelector
            value={expense.client_id}
            clearButton={Boolean(expense.client_id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onChange={(client) => handleChange('client_id', client.id)}
          />
        </Element>
      )}

      {expense && (
        <Element leftSide={t('project')}>
          <ProjectSelector
            value={expense.project_id}
            clearButton={Boolean(expense.project_id)}
            onClearButtonClick={() => handleChange('project_id', '')}
            onChange={(client) => handleChange('project_id', client.id)}
          />
        </Element>
      )}

      {expense && (
        <Element leftSide={t('category')}>
          <ExpenseCategorySelector
            value={expense.category_id}
            clearButton={Boolean(expense.category_id)}
            onClearButtonClick={() => handleChange('category_id', '')}
            onChange={(category) => handleChange('category_id', category.id)}
          />
        </Element>
      )}

      {expense && (
        <Element leftSide={t('user')}>
          <UserSelector
            value={expense.assigned_user_id}
            clearButton={Boolean(expense.assigned_user_id)}
            onClearButtonClick={() => handleChange('assigned_user_id', '')}
            onChange={(user) => handleChange('assigned_user_id', user.id)}
          />
        </Element>
      )}

      {expense && (
        <Element leftSide={t('amount')}>
          <InputField
            value={expense.amount}
            onValueChange={(value) => handleChange('amount', parseFloat(value) || 0)}
          />
        </Element>
      )}

      

      {expense && (
        <Element leftSide={t('currency')}>
          <CurrencySelector
            value={expense.currency_id}
            onChange={(currency) => handleChange('currency_id', currency)}
          />
        </Element>
      )}
    </Card>
  );
}
