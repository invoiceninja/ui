/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Table as DocumentsTable, Upload } from './components';

export function Documents() {
  useTitle('documents');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
    { name: t('documents'), href: '/settings/company_details/documents' },
  ];

  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries('/api/v1/documents');
  };

  const company = useCurrentCompany();

  return (
    <Settings title={t('documents')}>
      <Breadcrumbs pages={pages} />

      {company && (
        <Upload
          endpoint={endpoint('/api/v1/companies/:id/upload', {
            id: company.id,
          })}
          onSuccess={onSuccess}
        />
      )}

      <DocumentsTable />
    </Settings>
  );
}
