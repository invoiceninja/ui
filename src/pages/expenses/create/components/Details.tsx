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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Expense } from '$app/common/interfaces/expense';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { ExpenseCategorySelector } from '$app/components/expense-categories/ExpenseCategorySelector';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { useTranslation } from 'react-i18next';
import { ExpenseStatus } from '../../common/components/ExpenseStatus';
import { CustomField } from '$app/components/CustomField';
import { useCalculateExpenseAmount } from '../../common/hooks/useCalculateExpenseAmount';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';

export interface ExpenseCardProps {
  expense: Expense | undefined;
  handleChange: <T extends keyof Expense>(
    property: T,
    value: Expense[T]
  ) => void;
  errors?: ValidationBag | undefined;
}

interface Props extends ExpenseCardProps {
  taxInputType: 'by_rate' | 'by_amount';
  pageType: 'create' | 'edit';
}

export function Details(props: Props) {
  const [t] = useTranslation();

  const { expense, handleChange, taxInputType, pageType, errors } = props;

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();
  const calculateExpenseAmount = useCalculateExpenseAmount();

  return (
    <div className="flex flex-col space-y-4">
      {expense && (
        <Card>
          <Element leftSide={t('expense_total')} withoutWrappingLeftSide>
            {formatMoney(
              calculateExpenseAmount(expense),
              expense.client?.country_id,
              expense.currency_id || expense.client?.settings.currency_id
            )}
          </Element>
        </Card>
      )}

      <Card title={t('details')} isLoading={!expense}>
        {expense && pageType === 'edit' && (
          <>
            <Element leftSide={t('status')}>
              <ExpenseStatus entity={expense} />
            </Element>

            <Element leftSide={t('expense_number')}>
              <InputField
                id="number"
                value={expense.number}
                onValueChange={(value) => handleChange('number', value)}
                errorMessage={errors?.errors.number}
              />
            </Element>
          </>
        )}

        {expense && (
          <Element leftSide={t('vendor')}>
            <VendorSelector
              value={expense.vendor_id}
              onChange={(vendor) => handleChange('vendor_id', vendor.id)}
              onClearButtonClick={() => handleChange('vendor_id', '')}
              errorMessage={errors?.errors.vendor_id}
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
              errorMessage={errors?.errors.client_id}
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
              errorMessage={errors?.errors.project_id}
            />
          </Element>
        )}

        {expense && (
          <Element leftSide={t('category')}>
            <ExpenseCategorySelector
              value={expense.category_id}
              onClearButtonClick={() => handleChange('category_id', '')}
              onChange={(category) => handleChange('category_id', category.id)}
              errorMessage={errors?.errors.category_id}
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
              errorMessage={errors?.errors.assigned_user_id}
            />
          </Element>
        )}

        {/* Tax 1 */}
        {expense &&
          company?.enabled_expense_tax_rates > 0 &&
          taxInputType === 'by_rate' && (
            <Element leftSide={t('tax')}>
              <TaxRateSelector
                defaultValue={expense.tax_name1}
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
                onTaxCreated={(taxRate) => {
                  handleChange('tax_rate1', taxRate.rate);

                  handleChange('tax_name1', taxRate.name);
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
                  value={expense.tax_name1}
                  onValueChange={(value) => handleChange('tax_name1', value)}
                  errorMessage={errors?.errors.tax_name1}
                  cypressRef="taxNameByAmount1"
                />
                <InputField
                  type="number"
                  label={t('tax_amount')}
                  value={expense.tax_amount1}
                  onValueChange={(value) =>
                    handleChange('tax_amount1', parseFloat(value))
                  }
                  errorMessage={errors?.errors.tax_amount1}
                  cypressRef="taxRateByAmount1"
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
                defaultValue={expense.tax_name2}
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
                onTaxCreated={(taxRate) => {
                  handleChange('tax_rate2', taxRate.rate);

                  handleChange('tax_name2', taxRate.name);
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
                  value={expense.tax_name2}
                  onValueChange={(value) => handleChange('tax_name2', value)}
                  errorMessage={errors?.errors.tax_name2}
                  cypressRef="taxNameByAmount2"
                />
                <InputField
                  type="number"
                  label={t('tax_amount')}
                  value={expense.tax_amount2}
                  onValueChange={(value) =>
                    handleChange('tax_amount2', parseFloat(value))
                  }
                  errorMessage={errors?.errors.tax_amount2}
                  cypressRef="taxRateByAmount2"
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
                defaultValue={expense.tax_name3}
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
                onTaxCreated={(taxRate) => {
                  handleChange('tax_rate3', taxRate.rate);

                  handleChange('tax_name3', taxRate.name);
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
                  value={expense.tax_name3}
                  onValueChange={(value) => handleChange('tax_name3', value)}
                  errorMessage={errors?.errors.tax_name3}
                />
                <InputField
                  type="number"
                  label={t('tax_amount')}
                  value={expense.tax_amount3}
                  onValueChange={(value) =>
                    handleChange('tax_amount3', parseFloat(value))
                  }
                  errorMessage={errors?.errors.tax_amount3}
                />
              </div>
            </Element>
          )}

        {expense && (
          <Element leftSide={t('amount')}>
            <InputField
              type="number"
              value={expense.amount}
              onValueChange={(value) =>
                handleChange('amount', parseFloat(value) || 0)
              }
              errorMessage={errors?.errors.amount}
            />
          </Element>
        )}

        {expense && (
          <Element leftSide={t('currency')}>
            <CurrencySelector
              value={expense.currency_id}
              onChange={(currency) => handleChange('currency_id', currency)}
              errorMessage={errors?.errors.currency_id}
            />
          </Element>
        )}

        {expense && (
          <Element leftSide={t('date')}>
            <InputField
              type="date"
              onValueChange={(value) => handleChange('date', value)}
              errorMessage={errors?.errors.date}
              value={expense.date}
            />
          </Element>
        )}

        {expense && company?.custom_fields?.expense1 && (
          <CustomField
            field="expense1"
            defaultValue={expense.custom_value1 || ''}
            value={company.custom_fields.expense1}
            onValueChange={(value) =>
              handleChange('custom_value1', String(value))
            }
          />
        )}

        {expense && company?.custom_fields?.expense2 && (
          <CustomField
            field="expense2"
            defaultValue={expense.custom_value2 || ''}
            value={company.custom_fields.expense2}
            onValueChange={(value) =>
              handleChange('custom_value2', String(value))
            }
          />
        )}

        {expense && company?.custom_fields?.expense3 && (
          <CustomField
            field="expense3"
            defaultValue={expense.custom_value3 || ''}
            value={company.custom_fields.expense3}
            onValueChange={(value) =>
              handleChange('custom_value3', String(value))
            }
          />
        )}

        {expense && company?.custom_fields?.expense4 && (
          <CustomField
            field="expense4"
            defaultValue={expense.custom_value4 || ''}
            value={company.custom_fields.expense4}
            onValueChange={(value) =>
              handleChange('custom_value4', String(value))
            }
          />
        )}
      </Card>
    </div>
  );
}
