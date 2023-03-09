/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isDemo } from '$app/common/helpers';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';

export function useAccountManagementTabs() {
  const [t] = useTranslation();

  const tabs: Tab[] = [
    { name: t('plan'), href: '/settings/account_management' },
    { name: t('overview'), href: '/settings/account_management/overview' },
    {
      name: t('enabled_modules'),
      href: '/settings/account_management/enabled_modules',
    },
    {
      name: t('integrations'),
      href: '/settings/account_management/integrations',
    },
    {
      name: t('security_settings'),
      href: '/settings/account_management/security_settings',
    },
  ];

  const updatedTabsList = !isDemo()
    ? [
        ...tabs,
        {
          name: t('danger_zone'),
          href: '/settings/account_management/danger_zone',
        },
      ]
    : tabs;

  return updatedTabsList;
}
