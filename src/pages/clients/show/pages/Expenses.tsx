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
import {
  useExpenseColumns,
  useExpenseFilters,
} from '$app/pages/expenses/common/hooks';
import { useParams } from 'react-router-dom';

export const dataTableStaleTime = 50;

export function Expenses() {
  const { id } = useParams();

  const columns = useExpenseColumns();

  const filters = useExpenseFilters();

  return (
    <DataTable
      resource="expense"
      endpoint={route('/api/v1/expenses?include=client,vendor&client_id=:id', {
        id,
      })}
      columns={columns}
      customFilters={filters}
      customFilterQueryKey="client_status"
      customFilterPlaceholder="status"
      withResourcefulActions
      bulkRoute="/api/v1/expenses/bulk"
      linkToCreate={route('/expenses/create?client=:id', { id })}
      linkToEdit="/expenses/:id/edit"
      staleTime={dataTableStaleTime}
    />
  );
}
