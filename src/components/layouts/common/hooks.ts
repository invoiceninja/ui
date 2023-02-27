/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAdmin } from 'common/hooks/permissions/useHasPermission';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export interface SettingsRoute {
  name: string;
  href: string;
  current: boolean;
  enabled: boolean;
  children?: SettingsRoute[];
}

export function useSettingsRoutes() {
  const [t] = useTranslation();
  const location = useLocation();

  const { isOwner, isAdmin } = useAdmin();

  const basic: SettingsRoute[] = [
    {
      name: t('company_details'),
      href: '/settings/company_details',
      current: location.pathname.startsWith('/settings/company_details'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('user_details'),
      href: '/settings/user_details',
      current: location.pathname.startsWith('/settings/user_details'),
      enabled: true,
    },
    {
      name: t('localization'),
      href: '/settings/localization',
      current: location.pathname.startsWith('/settings/localization'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('payment_settings'),
      href: '/settings/online_payments',
      current: location.pathname.startsWith('/settings/online_payments'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('tax_settings'),
      href: '/settings/tax_settings',
      current: location.pathname.startsWith('/settings/tax_settings'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('product_settings'),
      href: '/settings/product_settings',
      current: location.pathname.startsWith('/settings/product_settings'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('task_settings'),
      href: '/settings/task_settings',
      current: location.pathname.startsWith('/settings/task_settings'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('expense_settings'),
      href: '/settings/expense_settings',
      current: location.pathname.startsWith('/settings/expense_settings'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('workflow_settings'),
      href: '/settings/workflow_settings',
      current: location.pathname.startsWith('/settings/workflow_settings'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('account_management'),
      href: '/settings/account_management',
      current: location.pathname.startsWith('/settings/account_management'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('backup_restore'),
      href: '/settings/backup_restore',
      current: location.pathname.startsWith('/settings/backup_restore'),
      enabled: isAdmin || isOwner || false,
    },
  ];

  const advanced: SettingsRoute[] = [
    {
      name: t('invoice_design'),
      href: '/settings/invoice_design',
      current: location.pathname.startsWith('/settings/invoice_design'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('generated_numbers'),
      href: '/settings/generated_numbers',
      current: location.pathname.startsWith('/settings/generated_numbers'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('client_portal'),
      href: '/settings/client_portal',
      current: location.pathname.startsWith('/settings/client_portal'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('email_settings'),
      href: '/settings/email_settings',
      current: location.pathname.startsWith('/settings/email_settings'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('templates_and_reminders'),
      href: '/settings/templates_and_reminders',
      current: location.pathname.startsWith(
        '/settings/templates_and_reminders'
      ),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('bank_accounts'),
      href: '/settings/bank_accounts',
      current: location.pathname.startsWith('/settings/bank_accounts'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('subscriptions'),
      href: '/settings/subscriptions',
      current: location.pathname.startsWith('/settings/subscriptions'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('schedules'),
      href: '/settings/schedules',
      current: location.pathname.startsWith('/settings/schedules'),
      enabled: isAdmin || isOwner || false,
    },
    {
      name: t('user_management'),
      href: '/settings/users',
      current: location.pathname.startsWith('/settings/users'),
      enabled: isAdmin || isOwner || false,
    },
  ];

  return { basic, advanced };
}
