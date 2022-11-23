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

export function useUserDetailsTabs() {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    { name: t('details'), href: '/settings/user_details' },
    {
      name: t('password'),
      href: '/settings/user_details/password',
    },
    {
      name: t('connect'),
      href: '/settings/user_details/connect',
    },
    {
      name: t('enable_two_factor'),
      href: '/settings/user_details/enable_two_factor',
    },
    {
      name: t('accent_color'),
      href: '/settings/user_details/accent_color',
    },
    {
      name: t('notifications'),
      href: '/settings/user_details/notifications',
    },
  ];

  return tabs;
}
