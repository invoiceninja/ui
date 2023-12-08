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
  useRecurringExpenseColumns,
} from '$app/pages/recurring-expenses/common/hooks';
import { useParams } from 'react-router-dom';

export default function RecurringExpenses() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const columns = useRecurringExpenseColumns();

  const actions = useActions();

  return (
    <DataTable
      resource="recurring_expense"
      endpoint={route(
        '/api/v1/recurring_expenses?include=client,vendor&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      customActions={actions}
      withResourcefulActions
      bulkRoute="/api/v1/recurring_expenses/bulk"
      linkToCreate={route('/recurring_expenses/create?client=:id', { id })}
      linkToEdit="/recurring_expenses/:id/edit"
      linkToCreateGuards={[permission('create_recurring_expense')]}
      hideEditableOptions={!hasPermission('edit_recurring_expense')}
    />
  );
}
