/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputLabel, Link } from '$app/components/forms';
import { useTitle } from '$app/common/hooks/useTitle';
import {
  DataTable,
  dateRangeAtom,
  filterColumnsValuesAtom,
} from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { BsKanban } from 'react-icons/bs';
import {
  defaultColumns,
  useActions,
  useAllTaskColumns,
  useCustomBulkActions,
  useTaskColumns,
  useTaskFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Inline } from '$app/components/Inline';
import { permission } from '$app/common/guards/guards/permission';
import { Task } from '$app/common/interfaces/task';
import { useShowEditOption } from '../common/hooks/useShowEditOption';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { ImportButton } from '$app/components/import/ImportButton';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import {
  TaskSlider,
  taskSliderAtom,
  taskSliderVisibilityAtom,
} from '../common/components/TaskSlider';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useTaskQuery } from '$app/common/queries/tasks';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { ExtensionBanner } from '../common/components/ExtensionBanner';
import { useFilterColumns } from '../common/hooks/useFilterColumns';
import { emitter } from '$app';

export default function Tasks() {
  const { documentTitle } = useTitle('tasks');

  const [t] = useTranslation();
  const hasPermission = useHasPermission();
  const showEditOption = useShowEditOption();
  const disableNavigation = useDisableNavigation();

  const pages = [{ name: t('tasks'), href: '/tasks' }];

  const actions = useActions();
  const filters = useTaskFilters();
  const columns = useTaskColumns();
  const taskColumns = useAllTaskColumns();
  const filterColumns = useFilterColumns();
  const customBulkActions = useCustomBulkActions();

  const [dateRange, setDateRange] = useAtom(dateRangeAtom);
  const [taskSlider, setTaskSlider] = useAtom(taskSliderAtom);
  const [sliderTaskId, setSliderTaskId] = useState<string>('');
  const [taskSliderVisibility, setTaskSliderVisibility] = useAtom(
    taskSliderVisibilityAtom
  );
  const [filterColumnsValues, setFilterColumnsValues] = useAtom(
    filterColumnsValuesAtom
  );

  const { data: taskResponse } = useTaskQuery({ id: sliderTaskId });

  useEffect(() => {
    if (taskResponse && taskSliderVisibility) {
      setTaskSlider(taskResponse);
    }
  }, [taskResponse, taskSliderVisibility]);

  useEffect(() => {
    return () => setTaskSliderVisibility(false);
  }, []);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      aboveMainContainer={<ExtensionBanner />}
    >
      <DataTable
        resource="task"
        columns={columns}
        customActions={actions}
        endpoint="/api/v1/tasks?include=status,client,project,user,assigned_user&without_deleted_clients=true&sort=id|desc"
        bulkRoute="/api/v1/tasks/bulk"
        linkToCreate="/tasks/create"
        linkToEdit="/tasks/:id/edit"
        showEdit={(task: Task) => showEditOption(task)}
        customFilters={filters}
        customBulkActions={customBulkActions}
        customFilterPlaceholder="status"
        withResourcefulActions
        rightSide={
          <div className="flex items-center space-x-2">
            {(Object.keys(filterColumnsValues).length > 0 ||
              dateRange.length > 0) && (
              <Button
                type="secondary"
                behavior="button"
                onClick={() => {
                  setFilterColumnsValues({});
                  emitter.emit('date_range_picker.clear');
                }}
              >
                {t('clear_filters')} (
                {Object.keys(filterColumnsValues).length +
                  (dateRange.length > 0 ? 1 : 0)}
                )
              </Button>
            )}

            <DataTableColumnsPicker
              columns={taskColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="task"
            />

            <Guard
              type="component"
              component={<ImportButton route="/tasks/import" />}
              guards={[or(permission('create_task'), permission('edit_task'))]}
            />
          </div>
        }
        beforeFilter={
          (hasPermission('view_task') || hasPermission('edit_task')) && (
            <Link to="/tasks/kanban">
              <Inline>
                <BsKanban size={20} />
                <span>Kanban</span>
              </Inline>
            </Link>
          )
        }
        linkToCreateGuards={[permission('create_task')]}
        hideEditableOptions={!hasPermission('edit_task')}
        onTableRowClick={(quote) => {
          setSliderTaskId(quote.id);
          setTaskSliderVisibility(true);
        }}
        enableSavingFilterPreference
        filterColumns={filterColumns}
        dateRangeColumns={[
          { column: 'calculated_start_date', queryParameterKey: 'date_range' },
          { column: 'created_at', queryParameterKey: 'created_between' },
        ]}
      />

      {!disableNavigation('task', taskSlider) && <TaskSlider />}

      <ChangeTemplateModal<Task>
        entity="task"
        entities={changeTemplateResources as Task[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(task) => (
          <div className="flex flex-col space-y-1">
            <InputLabel>{t('number')}</InputLabel>

            <span>{task.number}</span>
          </div>
        )}
        bulkLabelFn={(task) => (
          <div className="flex space-x-2">
            <InputLabel>{t('number')}:</InputLabel>

            <span>{task.number}</span>
          </div>
        )}
        bulkUrl="/api/v1/tasks/bulk"
      />
    </Default>
  );
}
