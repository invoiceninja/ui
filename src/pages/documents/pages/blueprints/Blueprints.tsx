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
import { Default } from '$app/components/layouts/Default';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { useTableColumns } from './common/hooks/useTableColumns';

export default function Blueprints() {
  useTitle('blueprints');

  const [t] = useTranslation();

  const columns = useTableColumns();

  const pages = [
    {
      name: t('documents'),
      href: '/documents',
    },
    {
      name: t('blueprints'),
      href: '/documents/blueprints',
    },
  ];

  return (
    <Default title={t('blueprints')} breadcrumbs={pages}>
      <DataTable<Blueprint>
        resource="blueprint"
        endpoint="/api/blueprints?sort=id|desc"
        columns={columns}
        withResourcefulActions
        bulkRoute="/api/blueprints/bulk"
        linkToCreate="/documents/blueprints/create"
        linkToEdit="/documents/blueprints/:id/edit"
        useDocuNinjaApi
        endpointHeaders={{
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        }}
        totalPagesPropPath="data.meta.last_page"
        totalRecordsPropPath="data.meta.total"
        withoutActionBulkPayloadProperty
        withoutIdsBulkPayloadProperty
        useDeleteMethod
        deleteBulkRoute="/api/blueprints/:id"
      />
    </Default>
  );
}
