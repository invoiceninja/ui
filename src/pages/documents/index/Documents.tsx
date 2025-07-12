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
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { useTableColumns } from '../common/hooks/useTableColumns';

export default function Blueprints() {
  useTitle('blueprints');

  const [t] = useTranslation();

  const colors = useColorScheme();
  const columns = useTableColumns();

  return (
    <Card
      title={t('documents')}
      className="shadow-sm"
      childrenClassName="px-4 sm:px-6 pt-6 pb-8"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <DataTable<Blueprint>
        resource="document"
        endpoint="/api/documents?sort=id|desc"
        columns={columns}
        withResourcefulActions
        bulkRoute="/api/documents/bulk"
        linkToCreate="/documents/create"
        linkToEdit="/documents/:id/edit"
        useDocuNinjaApi
        endpointHeaders={{
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        }}
        totalPagesPropPath="data.meta.last_page"
        totalRecordsPropPath="data.meta.total"
      />
    </Card>
  );
}
