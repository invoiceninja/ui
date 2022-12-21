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
import { RecurringExpense } from 'common/interfaces/recurring-expense';
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
import dayjs from 'dayjs';

export interface RecurringExpenseCardProps {
  recurringExpense: RecurringExpense | undefined;
  handleChange: <T extends keyof RecurringExpense>(
    property: T,
    value: RecurringExpense[T]
  ) => void;
  errors?: ValidationBag | undefined;
}

interface Props extends RecurringExpenseCardProps {
  taxInputType: 'by_rate' | 'by_amount';
  pageType: 'create' | 'edit';
}

export function Details(props: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const { recurringExpense, handleChange, taxInputType, pageType, errors } =
    props;

  return (
    <Card title={t('details')} isLoading={!recurringExpense}>
      {recurringExpense && pageType === 'edit' && (
        <Element leftSide={t('number')}>
          <InputField
            value={recurringExpense.number}
            onValueChange={(value) => handleChange('number', value)}
            errorMessage={errors?.errors.number}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('vendor')}>
          <VendorSelector
            value={recurringExpense.vendor_id}
            clearButton={Boolean(recurringExpense.vendor_id)}
            onClearButtonClick={() => handleChange('vendor_id', '')}
            onChange={(vendor) => handleChange('vendor_id', vendor.id)}
            errorMessage={errors?.errors.vendor_id}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('client')}>
          <ClientSelector
            value={recurringExpense.client_id}
            clearButton={Boolean(recurringExpense.client_id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onChange={(client) => handleChange('client_id', client.id)}
            errorMessage={errors?.errors.client_id}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('project')}>
          <ProjectSelector
            value={recurringExpense.project_id}
            clearButton={Boolean(recurringExpense.project_id)}
            onClearButtonClick={() => handleChange('project_id', '')}
            onChange={(client) => handleChange('project_id', client.id)}
            errorMessage={errors?.errors.project_id}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('category')}>
          <ExpenseCategorySelector
            value={recurringExpense.category_id}
            clearButton={Boolean(recurringExpense.category_id)}
            onClearButtonClick={() => handleChange('category_id', '')}
            onChange={(category) => handleChange('category_id', category.id)}
            errorMessage={errors?.errors.category_id}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('user')}>
          <UserSelector
            value={recurringExpense.assigned_user_id}
            clearButton={Boolean(recurringExpense.assigned_user_id)}
            onClearButtonClick={() => handleChange('assigned_user_id', '')}
            onChange={(user) => handleChange('assigned_user_id', user.id)}
            errorMessage={errors?.errors.assigned_user_id}
          />
        </Element>
      )}

      {/* Tax 1 */}
      {recurringExpense &&
        company?.enabled_expense_tax_rates > 0 &&
        taxInputType === 'by_rate' && (
          <Element leftSide={t('tax')}>
            <TaxRateSelector
              defaultValue={recurringExpense.tax_rate1}
              clearButton={Boolean(recurringExpense.tax_rate1)}
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

      {recurringExpense &&
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
      {recurringExpense &&
        company?.enabled_expense_tax_rates > 1 &&
        taxInputType === 'by_rate' && (
          <Element leftSide={t('tax')}>
            <TaxRateSelector
              defaultValue={recurringExpense.tax_rate2}
              clearButton={Boolean(recurringExpense.tax_rate2)}
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

      {recurringExpense &&
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
      {recurringExpense &&
        company?.enabled_expense_tax_rates > 2 &&
        taxInputType === 'by_rate' && (
          <Element leftSide={t('tax')}>
            <TaxRateSelector
              defaultValue={recurringExpense.tax_rate3}
              clearButton={Boolean(recurringExpense.tax_rate3)}
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

      {recurringExpense &&
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

      {recurringExpense && (
        <Element leftSide={t('amount')}>
          <InputField
            value={recurringExpense.amount}
            onValueChange={(value) =>
              handleChange('amount', parseFloat(value) || 0)
            }
            errorMessage={errors?.errors.amount}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('currency')}>
          <CurrencySelector
            value={recurringExpense.currency_id}
            onChange={(currency) => handleChange('currency_id', currency)}
          />
        </Element>
      )}

      {recurringExpense && (
        <Element leftSide={t('date')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('date', value)}
            value={recurringExpense.date}
            errorMessage={errors?.errors.date}
          />
        </Element>
      )}

      <Element leftSide={t('frequency')}>
        <SelectField
          value={recurringExpense?.frequency_id}
          onValueChange={(value) => handleChange('frequency_id', value)}
          errorMessage={errors?.errors.frequency_id}
          withBlank
        >
          {Object.keys(frequencies).map((frequency, index) => (
            <option key={index} value={frequency}>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              {t(frequencies[frequency])}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('start_date')}>
        <InputField
          type="date"
          onValueChange={(value) => handleChange('next_send_date', value)}
          value={
            recurringExpense?.next_send_date
              ? dayjs(recurringExpense?.next_send_date).format('YYYY-MM-DD')
              : new Date().toISOString().split('T')[0]
          }
          min={new Date().toISOString().split('T')[0]}
          errorMessage={errors?.errors.next_send_date}
        />
      </Element>

      <Element leftSide={t('remaining_cycles')}>
        <SelectField
          value={recurringExpense?.remaining_cycles}
          onValueChange={(value) =>
            handleChange('remaining_cycles', parseInt(value))
          }
          errorMessage={errors?.errors.remaining_cycles}
        >
          <option value="-1">{t('endless')}</option>
          {[...Array(37).keys()].map((number, index) => (
            <option value={number} key={index}>
              {number}
            </option>
          ))}
        </SelectField>
      </Element>
    </Card>
  );
}
