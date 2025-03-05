/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';

export function useTabs() {
  const [t] = useTranslation();

  const tabs: Tab[] = [
    {
      name: t('create'),
      href: '/clients/create',
    },
    {
      name: t('settings'),
      href: '/clients/create/settings',
    },
    {
      name: t('documents'),
      href: '/clients/create/documents',
    },
    {
      name: t('locations'),
      href: '/clients/create/locations',
    },
  ];

  return tabs;
}
