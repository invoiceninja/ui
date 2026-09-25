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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Project } from '$app/common/interfaces/project';
import { Task } from '$app/common/interfaces/task';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ModuleBitmask } from '$app/pages/settings';
import {
  defaultColumns,
  useActions,
  useAllTaskColumns,
  useCustomBulkActions,
  useTaskColumns,
  useTaskFilters,
} from '$app/pages/tasks/common/hooks';
import { useFilterColumns } from '$app/pages/tasks/common/hooks/useFilterColumns';
import { useShowEditOption } from '$app/pages/tasks/common/hooks/useShowEditOption';
import { QuickCreateTask } from './QuickCreateTask';

interface Props {
  project: Project;
}

export const useShowProjectTasks = () => {
  const enabled = useEnabled();

  return enabled(ModuleBitmask.Tasks);
};

export function ProjectTasks({ project }: Props) {
  const hasPermission = useHasPermission();
  const showTasks = useShowProjectTasks();

  const actions = useActions();
  const columns = useTaskColumns();
  const filters = useTaskFilters();
  const taskColumns = useAllTaskColumns();
  const filterColumns = useFilterColumns();
  const showEditOption = useShowEditOption();
  const customBulkActions = useCustomBulkActions();

  if (!showTasks) {
    return null;
  }

  return (
    <DataTable
      resource="task"
      columns={columns}
      customActions={actions}
      endpoint={`/api/v1/tasks?include=status,client,project,user,assigned_user,tags&sort=id|desc&project_tasks=${project.id}&without_deleted_clients=true`}
      bulkRoute="/api/v1/tasks/bulk"
      linkToCreate={`/tasks/create?project=${project.id}&rate=${project.task_rate}`}
      linkToEdit="/tasks/:id/edit"
      showEdit={(task: Task) => showEditOption(task)}
      customFilters={filters}
      customBulkActions={customBulkActions}
      customFilterPlaceholder="status"
      filterColumns={filterColumns}
      afterRows={
        hasPermission('create_task') ? (
          <QuickCreateTask project={project} />
        ) : undefined
      }
      withResourcefulActions
      rightSide={
        <DataTableColumnsPicker
          columns={taskColumns as unknown as string[]}
          defaultColumns={defaultColumns}
          table="task"
        />
      }
      linkToCreateGuards={[permission('create_task')]}
      hideEditableOptions={!hasPermission('edit_task')}
    />
  );
}
