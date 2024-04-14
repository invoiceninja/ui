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
  MdDesignServices,
  MdDownload,
  MdEdit,
  MdNotStarted,
  MdRestore,
  MdStopCircle,
  MdTextSnippet,
} from 'react-icons/md';
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
import { Dispatch, SetStateAction } from 'react';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Assigned } from '$app/components/Assigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { User } from '$app/common/interfaces/user';

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
    'user',
    'assigned_user',
  ] as const;

  return taskColumns;
}

export function useTaskColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();
  const accentColor = useAccentColor();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const navigate = useNavigate();

  const taskColumns = useAllTaskColumns();
  type TaskColumns = (typeof taskColumns)[number];

  const formatUserName = (user: User) => {
    const firstName = user?.first_name ?? '';
    const lastName = user?.last_name ?? '';

    if (firstName.length === 0 && lastName.length === 0)
      return user?.email ?? 'Unknown User';

    return `${firstName} ${lastName}`;
  };

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
        <Assigned
          entityId={task.project_id}
          cacheEndpoint="/api/v1/projects"
          apiEndpoint="/api/v1/projects/:id"
          preCheck={
            hasPermission('view_project') || hasPermission('edit_project')
          }
          component={
            <Link to={route('/projects/:id', { id: task?.project?.id })}>
              {task?.project?.name}
            </Link>
          }
        />
      ),
    },
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, task) => (
        <div className="flex items-center space-x-2">
          <TaskStatus entity={task} />

          {task.invoice_id && (
            <MdTextSnippet
              className="cursor-pointer"
              fontSize={19}
              color={accentColor}
              onClick={() =>
                navigate(route('/invoices/:id/edit', { id: task.invoice_id }))
              }
            />
          )}
        </div>
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, task) => (
        <DynamicLink
          to={route('/tasks/:id/edit', { id: task.id })}
          renderSpan={disableNavigation('task', task)}
        >
          {value}
        </DynamicLink>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, task) =>
        task.client && (
          <DynamicLink
            to={route('/clients/:id', { id: value.toString() })}
            renderSpan={disableNavigation('client', task.client)}
          >
            {task.client.display_name}
          </DynamicLink>
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
      format: (value) => formatCustomFieldValue('task1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('task2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('task3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('task4', value?.toString()),
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
    {
      column: 'user',
      id: 'user_id',
      label: t('user'),
      format: (value, task) => formatUserName(task?.user),
    },
    {
      column: 'assigned_user',
      id: 'assigned_user_id',
      label: t('assigned_user'),
      format: (value, task) =>
        task?.assigned_user ? formatUserName(task?.assigned_user) : '',
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.task || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useSave() {
  return (task: Task) => {
    request('PUT', endpoint('/api/v1/tasks/:id', { id: task.id }), task).then(
      () => {
        toast.success('updated_task');

        $refetch(['tasks']);
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
    {
      label: t('uninvoiced'),
      value: 'uninvoiced',
      color: 'white',
      backgroundColor: '#F87171',
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

interface Params {
  showEditAction?: boolean;
  showCommonBulkAction?: boolean;
}
export function useActions(params?: Params) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const hasPermission = useHasPermission();

  const { showCommonBulkAction, showEditAction } = params || {};

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'task',
    editPageTabs: ['documents'],
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

  const { setChangeTemplateResources, setChangeTemplateVisible } =
    useChangeTemplate();

  const actions = [
    (task: Task) =>
      Boolean(showEditAction) && (
        <DropdownElement
          to={route('/tasks/:id/edit', { id: task.id })}
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    () => Boolean(showEditAction) && <Divider withoutPadding />,
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
      !task.invoice_id &&
      hasPermission('create_invoice') && (
        <DropdownElement
          onClick={() => invoiceTask([task])}
          icon={<Icon element={MdTextSnippet} />}
        >
          {t('invoice_task')}
        </DropdownElement>
      ),
    (task: Task) => <AddTasksOnInvoiceAction tasks={[task]} />,
    (task: Task) =>
      hasPermission('create_task') && (
        <DropdownElement
          onClick={() => cloneToTask(task)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>
      ),
    (task: Task) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([task]);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
    () =>
      (isEditPage || Boolean(showCommonBulkAction)) && (
        <Divider withoutPadding />
      ),
    (task: Task) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
      getEntityState(task) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([task.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (task: Task) =>
      (isEditPage || Boolean(showCommonBulkAction)) &&
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
      (isEditPage || Boolean(showCommonBulkAction)) &&
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

  const hasPermission = useHasPermission();

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

  const handleDownloadDocuments = (
    selectedTasks: Task[],
    setSelected?: Dispatch<SetStateAction<string[]>>
  ) => {
    const taskIds = getDocumentsIds(selectedTasks);

    documentsBulk(taskIds, 'download');
    setSelected?.([]);
  };

  const { setChangeTemplateVisible, setChangeTemplateResources } =
    useChangeTemplate();

  const customBulkActions: CustomBulkAction<Task>[] = [
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showStartAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'start');
            setSelected([]);
          }}
          icon={<Icon element={MdNotStarted} />}
        >
          {t('start')}
        </DropdownElement>
      ),
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showStopAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'stop');
            setSelected([]);
          }}
          icon={<Icon element={MdStopCircle} />}
        >
          {t('stop')}
        </DropdownElement>
      ),
    ({ selectedResources, setSelected }) =>
      selectedResources &&
      showAddToInvoiceAction(selectedResources) && (
        <AddTasksOnInvoiceAction
          tasks={selectedResources}
          isBulkAction
          setSelected={setSelected}
        />
      ),
    ({ selectedResources, setSelected }) =>
      selectedResources &&
      showInvoiceTaskAction(selectedResources) &&
      hasPermission('create_invoice') ? (
        <DropdownElement
          onClick={() => {
            invoiceTask(selectedResources);
            setSelected([]);
          }}
          icon={<Icon element={MdTextSnippet} />}
        >
          {t('invoice_task')}
        </DropdownElement>
      ) : null,
    ({ selectedResources, setSelected }) => (
      <DropdownElement
        onClick={() =>
          selectedResources && shouldDownloadDocuments(selectedResources)
            ? handleDownloadDocuments(selectedResources, setSelected)
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
    ({ selectedResources }) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources(selectedResources);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
  ];

  return customBulkActions;
};
