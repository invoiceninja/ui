/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Breadcrumbs } from 'components/Breadcrumbs';
import { Settings } from 'components/layouts/Settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Table as DocumentsTable } from './components';

export function Documents() {
  const apiEndpoint = '/api/v1/companies/:id/upload';
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
    { name: t('documents'), href: '/settings/company_details/documents' },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('company')}: ${t(
      'documents'
    )}`;
  });

  return (
    <Settings title={t('documents')}>
      <Breadcrumbs pages={pages} />

      <Upload apiEndpoint={apiEndpoint} />
      <DocumentsTable />
    </Settings>
  );
}
