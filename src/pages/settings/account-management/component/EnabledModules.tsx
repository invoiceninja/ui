/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { updateChanges } from 'common/stores/slices/company-users';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

interface Module {
  label: string;
  bitmask: number;
}

export enum ModuleBitmask {
  Invoices = 4096,
  RecurringInvoices = 1,
  Quotes = 4,
  Credits = 2,
  Projects = 32,
  Tasks = 8,
  Vendors = 64,
  Expenses = 16,
  RecurringExpenses = 512,
}

export function EnabledModules() {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();
  const dispatch = useDispatch();

  const modules: Module[] = [
    { label: t('invoices'), bitmask: ModuleBitmask.Invoices },
    {
      label: t('recurring_invoices'),
      bitmask: ModuleBitmask.RecurringInvoices,
    },
    { label: t('quotes'), bitmask: ModuleBitmask.Quotes },
    { label: t('credits'), bitmask: ModuleBitmask.Credits },
    { label: t('projects'), bitmask: ModuleBitmask.Projects },
    { label: t('tasks'), bitmask: ModuleBitmask.Tasks },
    { label: t('vendors'), bitmask: ModuleBitmask.Vendors },
    { label: t('expenses'), bitmask: ModuleBitmask.Expenses },
    {
      label: t('recurring_expenses'),
      bitmask: ModuleBitmask.RecurringExpenses,
    },

    // { label: t('tickets'), bitmask: 128 },
    // { label: t('proposals'), bitmask: 256 },
    // { label: t('recurring_tasks'), bitmask: 1024 },
    // { label: t('recurring_quotes'), bitmask: 2048 },
    // { label: t('proformal_invoices'), bitmask: 8192 },
    // { label: t('purchase_orders'), bitmask: 16384 },
  ];

  const handleToggleChange = (value: boolean, bitmask: number) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: 'enabled_modules',
        value: companyChanges?.enabled_modules ^ bitmask,
      })
    );

  return (
    <Card title={t('enabled_modules')}>
      {modules.map((module, index) => (
        <Element key={index} leftSide={module.label}>
          <Toggle
            checked={Boolean(companyChanges?.enabled_modules & module.bitmask)}
            key={module.label}
            onChange={(value: boolean) =>
              handleToggleChange(value, module.bitmask)
            }
          />
        </Element>
      ))}
    </Card>
  );
}
