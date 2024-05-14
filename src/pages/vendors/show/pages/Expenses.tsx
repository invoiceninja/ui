/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { permission } from '$app/common/guards/guards/permission';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { DataTable } from '$app/components/DataTable';
import {
  useActions,
  useExpenseColumns,
  useExpenseFilters,
} from '$app/pages/expenses/common/hooks';
import { useParams } from 'react-router-dom';

export default function Expenses() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const columns = useExpenseColumns();

  const filters = useExpenseFilters();

  const actions = useActions();

  return (
    <DataTable
      resource="expense"
      endpoint={route(
        '/api/v1/expenses?include=client,vendor,category&vendor_id=:id&sort=id|desc',
        {
          id,
        }
      )}
      columns={columns}
      customFilters={filters}
      customActions={actions}
      customFilterPlaceholder="status"
      withResourcefulActions
      bulkRoute="/api/v1/expenses/bulk"
      linkToCreate={route('/expenses/create?vendor=:id', { id })}
      linkToEdit="/expenses/:id/edit"
      excludeColumns={['vendor_id']}
      linkToCreateGuards={[permission('create_expense')]}
      hideEditableOptions={!hasPermission('edit_expense')}
    />
  );
}
