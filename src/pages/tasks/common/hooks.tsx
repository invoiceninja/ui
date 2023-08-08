/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { date, endpoint, getEntityState } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Task } from '$app/common/interfaces/task';
import { Divider } from '$app/components/cards/Divider';
import { SelectOption } from '$app/components/datatables/Actions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Tooltip } from '$app/components/Tooltip';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdDownload,
  MdNotStarted,
  MdRestore,
  MdStopCircle,
  MdTextSnippet,
} from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { taskAtom } from './atoms';
import { TaskStatus } from './components/TaskStatus';
import {
  calculateEntityState,
  isTaskRunning,
} from './helpers/calculate-entity-state';
import { calculateHours } from './helpers/calculate-time';
import { useInvoiceTask } from './hooks/useInvoiceTask';
import { useStart } from './hooks/useStart';
import { useStop } from './hooks/useStop';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useSetAtom } from 'jotai';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { EntityState } from '$app/common/enums/entity-state';
import { useBulk } from '$app/common/queries/tasks';
import { AddTasksOnInvoiceAction } from './components/AddTasksOnInvoiceAction';
import { CustomBulkAction } from '$app/components/DataTable';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { useTaskStatusesQuery } from '$app/common/queries/task-statuses';
import {
  hexToRGB,
  isColorLight,
  useAdjustColorDarkness,
} from '$app/common/hooks/useAdjustColorDarkness';
import { useDocumentsBulk } from '$app/common/queries/documents';

export const defaultColumns: string[] = [
  'status',
  'number',
  'client',
  'description',
  'duration',
  'entity_state',
];

export function useAllTaskColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'task',
    });

  const taskColumns = [
    'status',
    'number',
    'client',
    'project',
    //   'project',  @Todo: Need to fetch relationship
    'description',
    'duration',
    'entity_state',
    'archived_at',
    //   'assigned_to', @Todo: Need to fetch relationship
    'calculated_rate',
    'created_at',
    //   'created_by', @Todo: Need to fetch relationship
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'date',
    'documents',
    //   'invoice', @Todo: Need to fetch the relationship
    'is_deleted',
    'is_invoiced',
    'is_running',
    'rate',
    'updated_at',
  ] as const;

  return taskColumns;
}

export function useTaskColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();

  const taskColumns = useAllTaskColumns();
  type TaskColumns = (typeof taskColumns)[number];

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'task',
    });

  const columns: DataTableColumnsExtended<Task, TaskColumns> = [
    {
      column: 'project',
      id: 'project_id',
      label: t('project'),
      format: (value, task) => (
        <Link to={route('/projects/:id/edit', { id: task?.project?.id })}>
          {task?.project?.name}
        </Link>
      ),
    },
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, task) => <TaskStatus entity={task} />,
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, task) => (
        <Link to={route('/tasks/:id/edit', { id: task.id })}>{value}</Link>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, task) =>
        task.client && (
          <Link to={route('/clients/:id', { id: value.toString() })}>
            {task.client.display_name}
          </Link>
        ),
    },
    {
      column: 'description',
      id: 'description',
      label: t('description'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span dangerouslySetInnerHTML={{ __html: value as string }} />
        </Tooltip>
      ),
    },
    {
      column: 'duration',
      id: 'time_log',
      label: t('duration'),
      format: (value) => calculateHours(value.toString(), true),
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, task) => t(calculateEntityState(task)),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'calculated_rate',
      id: 'rate',
      label: t('calculated_rate'),
      format: (value, task) =>
        formatMoney(
          task.rate || company.settings.default_task_rate,
          task.client?.country_id,
          task.client?.settings.currency_id
        ),
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: firstCustom,
      id: 'custom_value1',
      label: firstCustom,
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
    },
    {
      column: 'date',
      id: 'calculated_start_date',
      label: t('date'),
      format: (value, task) => date(task.date, dateFormat),
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, task) => task.documents.length,
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, task) => (task.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'is_invoiced',
      id: 'invoice_id',
      label: t('is_invoiced'),
      format: (value, task) => (task.invoice_id ? t('yes') : t('no')),
    },
    {
      column: 'is_running',
      id: 'is_running',
      label: t('is_running'),
      format: (value, task) => (isTaskRunning(task) ? t('yes') : t('no')),
    },
    {
      column: 'rate',
      id: 'rate',
      label: t('rate'),
      format: (value, task) =>
        formatMoney(
          value,
          task.client?.country_id,
          task.client?.settings.currency_id
        ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.task || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useSave() {
  const queryClient = useQueryClient();

  return (task: Task) => {
    request('PUT', endpoint('/api/v1/tasks/:id', { id: task.id }), task).then(
      () => {
        toast.success('updated_task');

        queryClient.invalidateQueries(
          route('/api/v1/tasks?project_tasks=:projectId&per_page=1000', {
            projectId: task.project_id,
          })
        );

        queryClient.invalidateQueries('/api/v1/tasks?per_page=1000');

        queryClient.invalidateQueries(
          route('/api/v1/tasks/:id', { id: task.id })
        );
      }
    );
  };
}

export function useTaskFilters() {
  const [t] = useTranslation();

  const adjustColorDarkness = useAdjustColorDarkness();

  const { data: taskStatuses } = useTaskStatusesQuery({
    status: 'active',
  });

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('invoiced'),
      value: 'invoiced',
      color: 'white',
      backgroundColor: '#22C55E',
    },
  ];

  taskStatuses?.data.forEach((taskStatus) => {
    const { red, green, blue, hex } = hexToRGB(taskStatus.color);

    const darknessAmount = isColorLight(red, green, blue) ? -220 : 220;

    filters.push({
      label: taskStatus.name,
      value: taskStatus.id,
      color: adjustColorDarkness(hex, darknessAmount),
      backgroundColor: taskStatus.color,
      queryKey: 'task_status',
    });
  });

  return filters;
}

export function useActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'task',
  });

  const start = useStart();

  const stop = useStop();

  const bulk = useBulk();

  const invoiceTask = useInvoiceTask();

  const setTask = useSetAtom(taskAtom);

  const cloneToTask = (task: Task) => {
    setTask({ ...task, id: '', documents: [], number: '', invoice_id: '' });

    navigate('/tasks/create?action=clone');
  };

  const actions = [
    (task: Task) =>
      !isTaskRunning(task) &&
      !task.invoice_id && (
        <DropdownElement
          onClick={() => start(task)}
          icon={<Icon element={MdNotStarted} />}
        >
          {t('start')}
        </DropdownElement>
      ),
    (task: Task) =>
      isTaskRunning(task) &&
      !task.invoice_id && (
        <DropdownElement
          onClick={() => stop(task)}
          icon={<Icon element={MdStopCircle} />}
        >
          {t('stop')}
        </DropdownElement>
      ),
    (task: Task) =>
      !isTaskRunning(task) &&
      !task.invoice_id && (
        <DropdownElement
          onClick={() => invoiceTask([task])}
          icon={<Icon element={MdTextSnippet} />}
        >
          {t('invoice_task')}
        </DropdownElement>
      ),
    (task: Task) => <AddTasksOnInvoiceAction tasks={[task]} />,
    (task: Task) => (
      <DropdownElement
        onClick={() => cloneToTask(task)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
    () => isEditPage && <Divider withoutPadding />,
    (task: Task) =>
      isEditPage &&
      getEntityState(task) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([task.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (task: Task) =>
      isEditPage &&
      (getEntityState(task) === EntityState.Archived ||
        getEntityState(task) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([task.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (task: Task) =>
      isEditPage &&
      (getEntityState(task) === EntityState.Active ||
        getEntityState(task) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([task.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

export const useCustomBulkActions = () => {
  const [t] = useTranslation();
  const invoiceTask = useInvoiceTask();

  const bulk = useBulk();

  const documentsBulk = useDocumentsBulk();

  const shouldDownloadDocuments = (tasks: Task[]) => {
    return tasks.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (tasks: Task[]) => {
    return tasks.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const showStartAction = (selectedTasks: Task[]) => {
    return selectedTasks.every(
      (task) => !isTaskRunning(task) && !task.invoice_id
    );
  };

  const showStopAction = (selectedTasks: Task[]) => {
    return selectedTasks.every(
      (task) => isTaskRunning(task) && !task.invoice_id
    );
  };

  const showInvoiceTaskAction = (selectedTasks: Task[]) => {
    return selectedTasks.every(
      (task) => !isTaskRunning(task) && !task.invoice_id
    );
  };

  const showAddToInvoiceAction = (selectedTasks: Task[]) => {
    return selectedTasks.every(
      (task) => !isTaskRunning(task) && !task.invoice_id && task.client_id
    );
  };

  const customBulkActions: CustomBulkAction<Task>[] = [
    (selectedIds, selectedTasks, onActionCall) =>
      selectedTasks &&
      showStartAction(selectedTasks) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'start', onActionCall)}
          icon={<Icon element={MdNotStarted} />}
        >
          {t('start')}
        </DropdownElement>
      ),
    (selectedIds, selectedTasks, onActionCall) =>
      selectedTasks &&
      showStopAction(selectedTasks) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'stop', onActionCall)}
          icon={<Icon element={MdStopCircle} />}
        >
          {t('stop')}
        </DropdownElement>
      ),
    (_, selectedTasks) =>
      selectedTasks &&
      showAddToInvoiceAction(selectedTasks) && (
        <AddTasksOnInvoiceAction tasks={selectedTasks} isBulkAction />
      ),
    (_, selectedTasks) =>
      selectedTasks && showInvoiceTaskAction(selectedTasks) ? (
        <DropdownElement
          onClick={() => invoiceTask(selectedTasks)}
          icon={<Icon element={MdTextSnippet} />}
        >
          {t('invoice_task')}
        </DropdownElement>
      ) : null,
    (_, selectedTasks, onActionCall) => (
      <DropdownElement
        onClick={() =>
          selectedTasks && shouldDownloadDocuments(selectedTasks)
            ? documentsBulk(
                getDocumentsIds(selectedTasks),
                'download',
                onActionCall
              )
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
  ];

  return customBulkActions;
};
