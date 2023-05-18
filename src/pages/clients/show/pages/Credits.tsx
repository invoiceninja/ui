/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { DataTable } from '$app/components/DataTable';
import { useParams } from 'react-router-dom';
import { dataTableStaleTime } from './Invoices';
import { useCreditColumns } from '$app/pages/credits/common/hooks';

export default function Credits() {
  const { id } = useParams();

  const columns = useCreditColumns();

  return (
    <DataTable
      resource="credit"
      endpoint={route(
        '/api/v1/credits?include=client&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/credits/bulk"
      linkToCreate={route('/credits/create?client=:id', { id: id })}
      staleTime={dataTableStaleTime}
    />
  );
}
