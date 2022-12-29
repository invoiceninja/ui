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
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { isTaskRunning } from '../common/helpers/calculate-entity-state';
import { BsKanban } from 'react-icons/bs';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useStart } from '../common/hooks/useStart';
import { useStop } from '../common/hooks/useStop';
import { useInvoiceTask } from '../common/hooks/useInvoiceTask';
import {
  defaultColumns,
  taskColumns,
  useTaskColumns,
  useTaskFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { Inline } from 'components/Inline';

export function Tasks() {
  const { documentTitle } = useTitle('tasks');
  const [t] = useTranslation();

  const pages = [{ name: t('tasks'), href: '/tasks' }];

  const columns = useTaskColumns();

  const start = useStart();

  const stop = useStop();

  const invoiceTask = useInvoiceTask();

  const filters = useTaskFilters();

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
        <DropdownElement onClick={() => invoiceTask([task])}>
          {t('invoice_task')}
        </DropdownElement>
      ),
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="task"
        columns={columns}
        customActions={actions}
        endpoint="/api/v1/tasks?include=status,client"
        bulkRoute="/api/v1/tasks/bulk"
        linkToEdit="/tasks/:id/edit"
        linkToCreate="/tasks/create"
        customFilters={filters}
        customFilterQueryKey="client_status"
        customFilterPlaceholder="status"
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={taskColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="task"
          />
        }
        beforeFilter={
          <Link to="/tasks/kanban">
            <Inline>
              <BsKanban size={20} />
              <span>Kanban</span>
            </Inline>
          </Link>
        }
      />
    </Default>
  );
}
