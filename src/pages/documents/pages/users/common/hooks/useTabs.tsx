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
import { Tab } from '$app/components/Tabs';

const useTabs = () => {
  const [t] = useTranslation();

  const tabs: Tab[] = [
    {
      name: t('create'),
      href: '/docuninja/users/create',
    },
    {
      name: t('documents'),
      href: '/credits/create/documents',
    },
    {
      name: t('settings'),
      href: '/credits/create/settings',
    },
  ];

  return tabs;
};

export default useTabs;
