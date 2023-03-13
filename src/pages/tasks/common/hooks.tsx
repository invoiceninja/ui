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
import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { Task } from '$app/common/interfaces/task';
import { Divider } from '$app/components/cards/Divider';
import { customField } from '$app/components/CustomField';
import { SelectOption } from '$app/components/datatables/Actions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Tooltip } from '$app/components/Tooltip';
import dayjs from 'dayjs';
import { useUpdateAtom } from 'jotai/utils';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import {
  MdControlPointDuplicate,
  MdEdit,
  MdNotStarted,
  MdStopCircle,
  MdTextSnippet,
} from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { taskAtom } from './atoms';
import { TaskStatus } from './components/TaskStatus';
import {
  calculateEntityState,
  isTaskRunning,
} from './helpers/calculate-entity-state';
import { calculateTime, parseTimeLog } from './helpers/calculate-time';
import { useInvoiceTask } from './hooks/useInvoiceTask';
import { useStart } from './hooks/useStart';
import { useStop } from './hooks/useStop';

export const taskColumns = [
  'status',
  'number',
  'client',
  //   'project',  @Todo: Need to fetch relationship
  'description',
  'duration',
  'entity_state',
  'archived_at',
  //   'assigned_to', @Todo: Need to fetch relationship
  'calculated_rate',
  'created_at',
  //   'created_by', @Todo: Need to fetch relationship
  'custom1',
  'custom2',
  'custom3',
  'custom4',
  'date',
  'documents',
  //   'invoice', @Todo: Need to fetch the relationship
  'is_deleted',
  'is_invoiced',
  'is_running',
  'rate',
  'updated_at',
] as const;

type TaskColumns = (typeof taskColumns)[number];

export const defaultColumns: TaskColumns[] = [
  'status',
  'number',
  'client',
  'description',
  'duration',
  'entity_state',
];

export function useTaskColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const currentUser = useCurrentUser();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  const calculateDate = (task: Task) => {
    const timeLog = parseTimeLog(task.time_log);

    if (timeLog.length === 0) {
      return '';
    }

    const [startTime] = timeLog[0];

    return dayjs.unix(startTime).format(dateFormat);
  };

  const columns: DataTableColumnsExtended<Task, TaskColumns> = [
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
        <Tooltip size="regular" truncate message={value as string}>
          <span>{value}</span>
        </Tooltip>
      ),
    },
    {
      column: 'duration',
      id: 'time_log',
      label: t('duration'),
      format: (value) => calculateTime(value.toString()),
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
          task.client?.country_id || company?.settings.country_id,
          task.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'custom1',
      id: 'custom_value1',
      label:
        (company?.custom_fields.task1 &&
          customField(company?.custom_fields.task1).label()) ||
        t('first_custom'),
    },
    {
      column: 'custom2',
      id: 'custom_value2',
      label:
        (company?.custom_fields.task2 &&
          customField(company?.custom_fields.task2).label()) ||
        t('second_custom'),
    },
    {
      column: 'custom3',
      id: 'custom_value3',
      label:
        (company?.custom_fields.task3 &&
          customField(company?.custom_fields.task3).label()) ||
        t('third_custom'),
    },
    {
      column: 'custom4',
      id: 'custom_value4',
      label:
        (company?.custom_fields.task4 &&
          customField(company?.custom_fields.task4).label()) ||
        t('forth_custom'),
    },
    {
      column: 'date',
      id: 'id',
      label: t('date'),
      format: (value, task) => calculateDate(task),
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
          task.client?.country_id || company?.settings.country_id,
          task.client?.settings.currency_id || company?.settings.currency_id
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
    currentUser?.company_user?.settings?.react_table_columns?.task ||
    defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useSave() {
  const queryClient = useQueryClient();

  return (task: Task) => {
    request('PUT', endpoint('/api/v1/tasks/:id', { id: task.id }), task)
      .then(() => {
        toast.success('updated_task');

        queryClient.invalidateQueries(
          route('/api/v1/tasks/:id', { id: task.id })
        );
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      });
  };
}

export function useTaskFilters() {
  const [t] = useTranslation();

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

  return filters;
}

export function useActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const company = useCurrentCompany();

  const start = useStart();

  const stop = useStop();

  const invoiceTask = useInvoiceTask();

  const setTask = useUpdateAtom(taskAtom);

  const cloneToTask = (task: Task) => {
    setTask({ ...task, id: '', documents: [], number: '' });

    navigate('/tasks/create?action=clone');
  };

  const actions = [
    (task: Task) =>
      !location.pathname.endsWith('/edit') &&
      (!task.invoice_id || !company?.invoice_task_lock) && (
        <DropdownElement
          onClick={() => navigate(route('/tasks/:id/edit', { id: task.id }))}
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    (task: Task) =>
      !location.pathname.endsWith('/edit') &&
      (!task.invoice_id || !company?.invoice_task_lock) && (
        <Divider withoutPadding />
      ),
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
    (task: Task) => (
      <DropdownElement
        onClick={() => cloneToTask(task)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
  ];

  return actions;
}
