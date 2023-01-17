/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { DataTable } from 'components/DataTable';
import {
  useExpenseColumns,
  useExpenseFilters,
} from 'pages/expenses/common/hooks';
import { useParams } from 'react-router-dom';

const dataTableStaleTime = 50;

export function Expenses() {
  const { id } = useParams();

  const columns = useExpenseColumns();

  const filters = useExpenseFilters();

  return (
    <DataTable
      resource="expense"
      endpoint={route('/api/v1/expenses?include=client,vendor&vendor_id=:id', {
        id,
      })}
      columns={columns}
      customFilters={filters}
      customFilterQueryKey="client_status"
      customFilterPlaceholder="status"
      withResourcefulActions
      bulkRoute="/api/v1/expenses/bulk"
      linkToCreate={route('/expenses/create?vendor=:id', { id })}
      linkToEdit="/expenses/:id/edit"
      staleTime={dataTableStaleTime}
    />
  );
}
