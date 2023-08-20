/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { updateChanges } from '$app/common/stores/slices/company-users';
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
  PurchaseOrders = 16384,
  Transactions = 32768,
}

export const modules: Module[] = [
  { label: 'invoices', bitmask: ModuleBitmask.Invoices },
  {
    label: 'recurring_invoices',
    bitmask: ModuleBitmask.RecurringInvoices,
  },
  { label: 'quotes', bitmask: ModuleBitmask.Quotes },
  { label: 'credits', bitmask: ModuleBitmask.Credits },
  { label: 'projects', bitmask: ModuleBitmask.Projects },
  { label: 'tasks', bitmask: ModuleBitmask.Tasks },
  { label: 'vendors', bitmask: ModuleBitmask.Vendors },
  { label: 'expenses', bitmask: ModuleBitmask.Expenses },
  { label: 'purchase_orders', bitmask: ModuleBitmask.PurchaseOrders },
  {
    label: 'recurring_expenses',
    bitmask: ModuleBitmask.RecurringExpenses,
  },
  { label: 'transactions', bitmask: ModuleBitmask.Transactions },

  // { label: t('tickets'), bitmask: 128 },
  // { label: t('proposals'), bitmask: 256 },
  // { label: t('recurring_tasks'), bitmask: 1024 },
  // { label: t('recurring_quotes'), bitmask: 2048 },
  // { label: t('proformal_invoices'), bitmask: 8192 },
  // { label: t('purchase_orders'), bitmask: 16384 },
];

export function EnabledModules() {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();
  const dispatch = useDispatch();

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
        <Element key={index} leftSide={t(module.label)}>
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
