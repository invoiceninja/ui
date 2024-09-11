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
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Expense } from '$app/common/interfaces/expense';
import { DataTable } from '$app/components/DataTable';
import { DynamicLink } from '$app/components/DynamicLink';
import { getEditPageLinkColumnOptions } from '$app/pages/expenses/common/helpers/columns';
import {
  useActions,
  useExpenseColumns,
  useExpenseFilters,
} from '$app/pages/expenses/common/hooks';
import { useParams } from 'react-router-dom';

export default function Expenses() {
  const { id } = useParams();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const { mainEditPageLinkColumns, editPageLinkColumnOptions } =
    getEditPageLinkColumnOptions();

  const actions = useActions();
  const filters = useExpenseFilters();
  const columns = useExpenseColumns();

  return (
    <DataTable
      resource="expense"
      endpoint={route(
        '/api/v1/expenses?include=client,vendor,category&client_id=:id&sort=id|desc',
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
      linkToCreate={route('/expenses/create?client=:id', { id })}
      linkToEdit="/expenses/:id/edit"
      excludeColumns={['client_id']}
      linkToCreateGuards={[permission('create_expense')]}
      hideEditableOptions={!hasPermission('edit_expense')}
      formatEditPageLinkColumn={(value, expense: Expense) => (
        <DynamicLink
          to={route('/expenses/:id/edit', { id: expense.id })}
          renderSpan={disableNavigation('expense', expense)}
        >
          {value}
        </DynamicLink>
      )}
      editPageLinkColumns={mainEditPageLinkColumns}
      editPageLinkColumnOptions={editPageLinkColumnOptions}
    />
  );
}
