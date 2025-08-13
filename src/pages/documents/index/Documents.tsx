/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { DataTable } from '$app/components/DataTable';
import { useTableColumns } from '../common/hooks/useTableColumns';
import { Document } from '$app/common/interfaces/docuninja/api';
import { Default } from '$app/components/layouts/Default';
import { Page } from '$app/components/Breadcrumbs';

export default function Blueprints() {
  useTitle('documents');

  const [t] = useTranslation();

  const columns = useTableColumns();

  const pages: Page[] = [
    {
      name: t('documents'),
      href: '/documents',
    },
  ];

  return (
    <Default title={t('documents')} breadcrumbs={pages}>
      <DataTable<Document>
        queryIdentificator="/api/documents/docuninja"
        resource="document"
        endpoint="/api/documents?sort=id|desc"
        columns={columns}
        withResourcefulActions
        bulkRoute="/api/documents/bulk"
        linkToCreate="/documents/create"
        linkToEdit="/documents/:id/builder"
        useDocuNinjaApi
        endpointHeaders={{
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        }}
        totalPagesPropPath="data.meta.last_page"
        totalRecordsPropPath="data.meta.total"
      />
    </Default>
  );
}
