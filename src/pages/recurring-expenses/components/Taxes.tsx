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
import { Link, Radio } from '$app/components/forms';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { RecurringExpenseCardProps } from './Details';

interface Props extends RecurringExpenseCardProps {
  taxInputType: 'by_rate' | 'by_amount';
  setTaxInputType: (type: 'by_rate' | 'by_amount') => unknown;
}

export function TaxSettings(props: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const { recurringExpense, handleChange, taxInputType, setTaxInputType } =
    props;

  const taxTypeChange = (value: string) => {
    setTaxInputType(value as 'by_rate' | 'by_amount');
    handleChange('calculate_tax_by_amount', value === 'by_amount');
  };

  return (
    <Card title={t('taxes')} isLoading={!recurringExpense}>
      {!company?.enabled_expense_tax_rates && (
        <Element leftSide={t('expense_tax_help')}>
          <Link to="/settings/tax_settings">{t('settings')}</Link>
        </Element>
      )}

      {company?.enabled_expense_tax_rates > 0 && recurringExpense && (
        <Element leftSide={t('enter_taxes')}>
          <Radio
            name="enter_taxes"
            options={[
              { id: 'by_rate', title: t('by_rate'), value: 'by_rate' },
              { id: 'by_amount', title: t('by_amount'), value: 'by_amount' },
            ]}
            defaultSelected={taxInputType}
            onValueChange={(value) => taxTypeChange(value)}
          />
        </Element>
      )}

      {company?.enabled_expense_tax_rates > 0 && recurringExpense && (
        <Element
          leftSide={t('inclusive_taxes')}
          leftSideHelp={
            <span className="flex flex-col">
              <span>{t('exclusive')}: 100 + 10% = 100 + 10</span>
              <span>{t('inclusive')}: 100 + 10% = 90.91 + 9.09</span>
            </span>
          }
        >
          <Toggle
            checked={recurringExpense.uses_inclusive_taxes}
            onChange={(value) => handleChange('uses_inclusive_taxes', value)}
          />
        </Element>
      )}
    </Card>
  );
}
