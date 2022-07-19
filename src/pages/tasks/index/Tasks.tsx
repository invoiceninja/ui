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
import { useTitle } from 'common/hooks/useTitle';
import { Task } from 'common/interfaces/task';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import {
  calculateEntityState,
  isTaskRunning,
} from '../common/helpers/calculate-entity-state';
import { calculateTime } from '../common/helpers/calculate-time';
import { BsKanban } from 'react-icons/bs';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useStart } from '../common/hooks/useStart';
import { useStop } from '../common/hooks/useStop';
import { useInvoiceTask } from '../common/hooks/useInvoiceTask';

export function Tasks() {
  const { documentTitle } = useTitle('tasks');
  const [t] = useTranslation();

  const pages = [{ name: t('tasks'), href: '/tasks' }];

  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, task: Task) => (
        <StatusBadge for={{}} code={task.status?.name || 'logged'} />
      ),
    },
    {
      id: 'number',
      label: t('number'),
      format: (value, task: Task) => (
        <Link to={generatePath('/tasks/:id/edit', { id: task.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, task: Task) =>
        task.client && (
          <Link to={generatePath('/clients/:id', { id: value.toString() })}>
            {task.client.display_name}
          </Link>
        ),
    },
    {
      id: 'description',
      label: t('description'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      id: 'time_log',
      label: t('duration'),
      format: (value) => calculateTime(value.toString()),
    },
    {
      id: 'id', // This is calculated column, so real mapping doesn't matter.
      label: t('entity_state'),
      format: (value, resource: Task) => t(calculateEntityState(resource)),
    },
  ];

  const start = useStart();
  const stop = useStop();
  const invoiceTask = useInvoiceTask();

  const actions = [
    (task: Task) =>
      !isTaskRunning(task) && (
        <DropdownElement onClick={() => start(task)}>
          {t('start')}
        </DropdownElement>
      ),
    (task: Task) =>
      isTaskRunning(task) && (
        <DropdownElement onClick={() => stop(task)}>
          {t('stop')}
        </DropdownElement>
      ),
    (task: Task) =>
      !isTaskRunning(task) &&
      !task.invoice_id && (
        <DropdownElement onClick={() => invoiceTask(task)}>
          {t('invoice_task')}
        </DropdownElement>
      ),
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <Link to="/tasks/kanban" className="inline-flex items-center space-x-2">
          <BsKanban size={20} />
        </Link>
      }
    >
      <DataTable
        resource="task"
        columns={columns}
        customActions={actions}
        endpoint="/api/v1/tasks?include=status,client"
        bulkRoute="/api/v1/tasks/bulk"
        linkToEdit="/tasks/:id/edit"
        linkToCreate="/tasks/create"
        withResourcefulActions
      />
    </Default>
  );
}
