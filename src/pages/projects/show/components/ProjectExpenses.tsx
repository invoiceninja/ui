/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEnabled } from '$app/common/guards/guards/enabled';
import { permission } from '$app/common/guards/guards/permission';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Project } from '$app/common/interfaces/project';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import {
  defaultColumns,
  useActions,
  useAllExpenseColumns,
  useExpenseColumns,
  useExpenseFilters,
} from '$app/pages/expenses/common/hooks';
import { useCustomBulkActions } from '$app/pages/expenses/common/hooks/useCustomBulkActions';
import { ModuleBitmask } from '$app/pages/settings';

interface Props {
  project: Project;
}

export const useShowProjectExpenses = () => {
  const enabled = useEnabled();
  const hasPermission = useHasPermission();

  return (
    enabled(ModuleBitmask.Expenses) &&
    (hasPermission('view_expense') || hasPermission('edit_expense'))
  );
};

export function ProjectExpenses({ project }: Props) {
  const hasPermission = useHasPermission();
  const showExpenses = useShowProjectExpenses();

  const actions = useActions();
  const filters = useExpenseFilters();
  const columns = useExpenseColumns();
  const expenseColumns = useAllExpenseColumns();
  const customBulkActions = useCustomBulkActions();

  if (!showExpenses) {
    return null;
  }

  return (
    <DataTable
      resource="expense"
      columns={columns}
      customActions={actions}
      endpoint={`/api/v1/expenses?include=client,vendor,category,project&without_deleted_clients=true&without_deleted_vendors=true&sort=id|desc&project_ids=${project.id}`}
      bulkRoute="/api/v1/expenses/bulk"
      linkToCreate={route(
        '/expenses/create?project=:projectId&client=:clientId',
        {
          projectId: project.id,
          clientId: project.client_id,
        }
      )}
      linkToEdit="/expenses/:id/edit"
      customFilters={filters}
      customBulkActions={customBulkActions}
      customFilterPlaceholder="status"
      withResourcefulActions
      rightSide={
        <DataTableColumnsPicker
          columns={expenseColumns as unknown as string[]}
          defaultColumns={defaultColumns}
          table="expense"
        />
      }
      linkToCreateGuards={[permission('create_expense')]}
      hideEditableOptions={!hasPermission('edit_expense')}
    />
  );
}
