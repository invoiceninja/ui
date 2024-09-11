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
import { Task } from '$app/common/interfaces/task';
import { useClientQuery } from '$app/common/queries/clients';
import { DataTable } from '$app/components/DataTable';
import { DynamicLink } from '$app/components/DynamicLink';
import { getEditPageLinkColumnOptions } from '$app/pages/tasks/common/helpers/columns';
import {
  useActions,
  useCustomBulkActions,
  useTaskColumns,
  useTaskFilters,
} from '$app/pages/tasks/common/hooks';
import { useShowEditOption } from '$app/pages/tasks/common/hooks/useShowEditOption';
import { useParams } from 'react-router-dom';

export default function Tasks() {
  const { id } = useParams();

  const hasPermission = useHasPermission();
  const showEditOption = useShowEditOption();
  const disableNavigation = useDisableNavigation();

  const { data: client } = useClientQuery({ id, enabled: true });

  const actions = useActions();
  const filters = useTaskFilters();
  const columns = useTaskColumns();
  const customBulkActions = useCustomBulkActions();
  const { mainEditPageLinkColumns, editPageLinkColumnOptions } =
    getEditPageLinkColumnOptions();

  return (
    <DataTable
      resource="task"
      endpoint={route(
        '/api/v1/tasks?include=status,client&client_id=:id&sort=id|desc',
        {
          id,
        }
      )}
      columns={columns}
      customFilters={filters}
      customActions={actions}
      customBulkActions={customBulkActions}
      customFilterPlaceholder="status"
      withResourcefulActions
      bulkRoute="/api/v1/tasks/bulk"
      linkToCreate={route('/tasks/create?client=:id&rate=:rate', {
        id: id,
        rate: client?.settings?.default_task_rate || '',
      })}
      linkToEdit="/tasks/:id/edit"
      excludeColumns={['client_id']}
      showEdit={(task: Task) => showEditOption(task)}
      linkToCreateGuards={[permission('create_task')]}
      hideEditableOptions={!hasPermission('edit_task')}
      formatEditPageLinkColumn={(value, task) => (
        <DynamicLink
          to={route('/tasks/:id/edit', { id: task.id })}
          renderSpan={disableNavigation('task', task)}
        >
          {value}
        </DynamicLink>
      )}
      editPageLinkColumns={mainEditPageLinkColumns}
      editPageLinkColumnOptions={editPageLinkColumnOptions}
    />
  );
}
