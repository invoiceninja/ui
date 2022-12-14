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

export function useCompanyImportExportTabs() {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    { name: t('backup'), href: '/settings/company_import_export' },
    { name: t('export'), href: '/settings/company_import_export/export' },
  ];

  return tabs;
}
