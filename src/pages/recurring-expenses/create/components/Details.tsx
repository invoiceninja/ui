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
import { InputField, SelectField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ClientSelector } from 'components/clients/ClientSelector';
import { CurrencySelector } from 'components/CurrencySelector';
import { ExpenseCategorySelector } from 'components/expense-categories/ExpenseCategorySelector';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { TaxRateSelector } from 'components/tax-rates/TaxRateSelector';
import { UserSelector } from 'components/users/UserSelector';
import { VendorSelector } from 'components/vendors/VendorSelector';
import { useTranslation } from 'react-i18next';
import frequencies from 'common/constants/frequency';
<<<<<<< HEAD
import { RecurringExpense } from 'common/interfaces/recurring-expense';
=======
import { RecurringExpense } from 'common/interfaces/recurring-expenses';
>>>>>>> 602e11a30ebfb368655d1d04e18289a0af3908c0
import dayjs from 'dayjs';

export interface ExpenseCardProps {
  expense: RecurringExpense | undefined;
  handleChange: <T extends keyof RecurringExpense>(
    property: T,
    value: RecurringExpense[T]
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

  return (
    <Card title={t('details')} isLoading={!expense}>
      {expense && pageType === 'edit' && (
        <Element leftSide={t('expense_number')}>
          <InputField
            value={expense.number}
            onValueChange={(value) => handleChange('number', value)}
            errorMessage={errors?.errors.number}
          />
        </Element>
      )}

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
            errorMessage={errors?.errors.amount}
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

      {expense && (
        <Element leftSide={t('frequency')}>
          <SelectField
            value={expense?.frequency_id}
            onValueChange={(value) => handleChange('frequency_id', value)}
          >
            {Object.keys(frequencies).map((frequency, index) => (
              <option key={index} value={frequency}>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore*/}
                {t(frequencies[frequency])}
              </option>
            ))}
          </SelectField>
        </Element>
      )}
      {expense && (
        <Element leftSide={t('start_date')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('next_send_date', value)}
            value={
              expense?.next_send_date
                ? dayjs(expense?.next_send_date).format('YYYY-MM-DD')
                : new Date().toISOString().split('T')[0]
            }
            min={new Date().toISOString().split('T')[0]}
          />
        </Element>
      )}

      {expense && (
        <Element leftSide={t('remaining_cycles')}>
          <SelectField
            value={expense.remaining_cycles}
            onValueChange={(value) =>
              handleChange('remaining_cycles', parseInt(value))
            }
          >
            <option value="-1">{t('endless')}</option>
            {[...Array(37).keys()].map((number, index) => (
              <option value={number} key={index}>
                {number}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

    </Card>
  );
}
