/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from 'components/Tabs';
import { useTranslation } from 'react-i18next';

export function useLocalizationTabs() {
  const [t] = useTranslation();

  const tabs: Tab[] = [
    { name: t('settings'), href: '/settings/localization' },
    {
      name: t('custom_labels'),
      href: '/settings/localization/custom_labels',
    },
  ];

  return tabs;
}
