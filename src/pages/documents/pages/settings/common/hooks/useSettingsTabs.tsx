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

export function useSettingsTabs() {
  const [t] = useTranslation();

  const tabs: Tab[] = [
    { name: t('company_details'), href: '/documents/settings' },
    { name: t('logo'), href: '/documents/settings/logo' },
    { name: t('email_templates'), href: '/documents/settings/email_templates' },
  ];

  return tabs;
}
