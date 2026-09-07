/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SettingsRoute {
  name: string;
  href: string;
  current: boolean;
  enabled: boolean;
}

export function useSettingsTabs() {
  const [t] = useTranslation();
  const location = useLocation();

  const routes: SettingsRoute[] = [
    {
      name: t('email_settings'),
      href: '/docuninja/settings/email_settings',
      current: location.pathname === '/docuninja/settings/email_settings',
      enabled: true,
    },
    {
      name: t('email_templates'),
      href: '/docuninja/settings/email_templates',
      current: location.pathname === '/docuninja/settings/email_templates',
      enabled: true,
    },
    {
      name: t('notifications'),
      href: '/docuninja/settings/notifications',
      current: location.pathname === '/docuninja/settings/notifications',
      enabled: true,
    },
    {
      name: t('widget_defaults'),
      href: '/docuninja/settings/widget_defaults',
      current: location.pathname === '/docuninja/settings/widget_defaults',
      enabled: true,
    },
    {
      name: t('reminder_schedules'),
      href: '/docuninja/settings/reminder_schedules',
      current: location.pathname === '/docuninja/settings/reminder_schedules',
      enabled: true,
    },
  ];

  return routes;
}
