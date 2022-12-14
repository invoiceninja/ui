/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from 'components/layouts/Settings';
import { Tabs } from 'components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useCompanyImportExportTabs } from '../common/hooks/useCompanyImportExportTabs';

export function ImportExport() {
  const [t] = useTranslation();

  const tabs = useCompanyImportExportTabs();

  const pages = [
    { name: t('settings'), href: '/settings' },
    {
      name: t('import_export'),
      href: '/settings/company_import_export',
    },
  ];

  return (
    <Settings title={t('import_export')} breadcrumbs={pages}>
      <Tabs tabs={tabs} className="mt-6" />

      <div className="my-4">
        <Outlet />
      </div>
    </Settings>
  );
}
