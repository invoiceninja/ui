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
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Expense } from 'common/interfaces/expense';
import { ClientSelector } from 'components/clients/ClientSelector';
import { CurrencySelector } from 'components/CurrencySelector';
import { ExpenseCategorySelector } from 'components/expense-categories/ExpenseCategorySelector';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { TaxRateSelector } from 'components/tax-rates/TaxRateSelector';
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

interface Props extends ExpenseCardProps {
  taxInputType: 'by_rate' | 'by_amount';
}

export function Details(props: Props) {
  const [t] = useTranslation();
  const { expense, handleChange, taxInputType } = props;
  const company = useCurrentCompany();

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

      {/* Tax 1 */}
      {expense &&
        company?.enabled_expense_tax_rates > 0 &&
        taxInputType === 'by_rate' && (
          <Element leftSide={t('tax')}>
            <TaxRateSelector
              defaultValue={expense.tax_rate1}
              clearButton={Boolean(expense.tax_rate1)}
              onClearButtonClick={() => {
                handleChange('tax_name1', '');
                handleChange('tax_rate1', 0);
              }}
              onChange={(taxRate) => {
                taxRate.resource &&
                  handleChange('tax_rate1', taxRate.resource.rate);

                taxRate.resource &&
                  handleChange('tax_name1', taxRate.resource.name);
              }}
            />
          </Element>
        )}

      {expense &&
        company?.enabled_expense_tax_rates > 0 &&
        taxInputType === 'by_amount' && (
          <Element leftSide={t('tax')}>
            <div className="flex flex-col xl:flex-row xl:items-center space-y-4 xl:space-y-0 xl:space-x-4">
              <InputField
                label={t('tax_name')}
                onValueChange={(value) => handleChange('tax_name1', value)}
              />
              <InputField
                label={t('tax_amount')}
                onValueChange={(value) =>
                  handleChange('tax_amount1', parseFloat(value))
                }
              />
            </div>
          </Element>
        )}

      {/* Tax 2 */}
      {expense &&
        company?.enabled_expense_tax_rates > 1 &&
        taxInputType === 'by_rate' && (
          <Element leftSide={t('tax')}>
            <TaxRateSelector
              defaultValue={expense.tax_rate2}
              clearButton={Boolean(expense.tax_rate2)}
              onClearButtonClick={() => {
                handleChange('tax_name2', '');
                handleChange('tax_rate2', 0);
              }}
              onChange={(taxRate) => {
                taxRate.resource &&
                  handleChange('tax_rate2', taxRate.resource.rate);

                taxRate.resource &&
                  handleChange('tax_name2', taxRate.resource.name);
              }}
            />
          </Element>
        )}

      {expense &&
        company?.enabled_expense_tax_rates > 1 &&
        taxInputType === 'by_amount' && (
          <Element leftSide={t('tax')}>
            <div className="flex flex-col xl:flex-row xl:items-center space-y-4 xl:space-y-0 xl:space-x-4">
              <InputField
                label={t('tax_name')}
                onValueChange={(value) => handleChange('tax_name2', value)}
              />
              <InputField
                label={t('tax_amount')}
                onValueChange={(value) =>
                  handleChange('tax_amount2', parseFloat(value))
                }
              />
            </div>
          </Element>
        )}

      {/* Tax 3 */}
      {expense &&
        company?.enabled_expense_tax_rates > 2 &&
        taxInputType === 'by_rate' && (
          <Element leftSide={t('tax')}>
            <TaxRateSelector
              defaultValue={expense.tax_rate3}
              clearButton={Boolean(expense.tax_rate3)}
              onClearButtonClick={() => {
                handleChange('tax_name3', '');
                handleChange('tax_rate3', 0);
              }}
              onChange={(taxRate) => {
                taxRate.resource &&
                  handleChange('tax_rate3', taxRate.resource.rate);

                taxRate.resource &&
                  handleChange('tax_name3', taxRate.resource.name);
              }}
            />
          </Element>
        )}

      {expense &&
        company?.enabled_expense_tax_rates > 2 &&
        taxInputType === 'by_amount' && (
          <Element leftSide={t('tax')}>
            <div className="flex flex-col xl:flex-row xl:items-center space-y-4 xl:space-y-0 xl:space-x-4">
              <InputField
                label={t('tax_name')}
                onValueChange={(value) => handleChange('tax_name3', value)}
              />
              <InputField
                label={t('tax_amount')}
                onValueChange={(value) =>
                  handleChange('tax_amount3', parseFloat(value))
                }
              />
            </div>
          </Element>
        )}

      {expense && (
        <Element leftSide={t('amount')}>
          <InputField
            value={expense.amount}
            onValueChange={(value) =>
              handleChange('amount', parseFloat(value) || 0)
            }
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
