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
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTableColumns } from './common/hooks/useTableColumns';

export default function Clients() {
  useTitle('clients');

  const [t] = useTranslation();

  const colors = useColorScheme();
  const columns = useTableColumns();

  const pages = [
    {
      name: t('documents'),
      href: '/documents',
    },
    {
      name: t('clients'),
      href: '/documents/clients',
    },
  ];

  return (
    <Default title={t('clients')} breadcrumbs={pages}>
      <Card
        title={t('clients')}
        className="shadow-sm"
        childrenClassName="px-4 sm:px-6 pt-6 pb-8"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <DataTable
          resource="client"
          endpoint="/api/clients?sort=id|desc"
          columns={columns}
          withResourcefulActions
          bulkRoute="/api/clients/bulk"
          linkToCreate="/documents/clients/create"
          linkToEdit="/documents/clients/:id/edit"
          useDocuNinjaApi
          endpointHeaders={{
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          }}
          totalPagesPropPath="data.meta.last_page"
          totalRecordsPropPath="data.meta.total"
        />
      </Card>
    </Default>
  );
}
