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

export function useCompanyDetailsTabs() {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    { name: t('details'), href: route('/settings/company_details/details') },
    { name: t('address'), href: route('/settings/company_details/address') },
    {
      name: t('logo'),
      href: route('/settings/company_details/logo'),
    },
    {
      name: t('defaults'),
      href: route('/settings/company_details/defaults'),
    },
    {
      name: t('documents'),
      href: route('/settings/company_details/documents'),
    },
    {
      name: t('custom_fields'),
      href: route('/settings/company_details/custom_fields'),
    },
  ];

  return tabs;
}
