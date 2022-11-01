/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { date } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { Task } from 'common/interfaces/task';
import { customField } from 'components/CustomField';
import dayjs from 'dayjs';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TaskStatus } from './components/TaskStatus';
import {
  calculateEntityState,
  isTaskRunning,
} from './helpers/calculate-entity-state';
import { calculateTime, parseTimeLog } from './helpers/calculate-time';

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
  //   'calculated_rate', @Todo: Diff vs `rate`?
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

type TaskColumns = typeof taskColumns[number];

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
      format: (value) => <span className="truncate">{value}</span>,
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
    // {
    //   column: 'calculated_rate',
    //   id: 'rate',
    //   label: t('calculated_rate'),
    //   format: (value, task) =>
    //     formatMoney(
    //       value,
    //       task.client?.country_id || company?.settings.country_id,
    //       task.client?.settings.currency_id || company?.settings.currency_id
    //     ),
    // },
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
