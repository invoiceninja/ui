/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { Tab } from 'components/Tabs';
import { useTranslation } from 'react-i18next';

export function useGeneratedNumbersTabs() {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    {
      name: t('settings'),
      href: route('/settings/generated_numbers'),
    },
    { name: t('clients'), href: route('/settings/generated_numbers/clients') },
    {
      name: t('invoices'),
      href: route('/settings/generated_numbers/invoices'),
    },
    {
      name: t('recurring_invoices'),
      href: route('/settings/generated_numbers/recurring_invoices'),
    },
    {
      name: t('payments'),
      href: route('/settings/generated_numbers/payments'),
    },
    {
      name: t('quotes'),
      href: route('/settings/generated_numbers/quotes'),
    },
    {
      name: t('credits'),
      href: route('/settings/generated_numbers/credits'),
    },
    {
      name: t('projects'),
      href: route('/settings/generated_numbers/projects'),
    },
    {
      name: t('tasks'),
      href: route('/settings/generated_numbers/tasks'),
    },
    {
      name: t('vendors'),
      href: route('/settings/generated_numbers/vendors'),
    },
    {
      name: t('purchase_orders'),
      href: route('/settings/generated_numbers/purchase_orders'),
    },
    {
      name: t('expenses'),
      href: route('/settings/generated_numbers/expenses'),
    },
    {
      name: t('recurring_expenses'),
      href: route('/settings/generated_numbers/recurring_expenses'),
    },
  ];

  return tabs;
}
