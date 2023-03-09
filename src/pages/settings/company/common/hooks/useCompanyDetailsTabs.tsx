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

export function useCompanyDetailsTabs() {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    { name: t('details'), href: '/settings/company_details' },
    { name: t('address'), href: '/settings/company_details/address' },
    {
      name: t('logo'),
      href: '/settings/company_details/logo',
    },
    {
      name: t('defaults'),
      href: '/settings/company_details/defaults',
    },
    {
      name: t('documents'),
      href: '/settings/company_details/documents',
    },
    {
      name: t('custom_fields'),
      href: '/settings/company_details/custom_fields',
    },
  ];

  return tabs;
}
