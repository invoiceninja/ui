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
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { BsKanban } from 'react-icons/bs';
import {
  defaultColumns,
  taskColumns,
  useActions,
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

  const filters = useTaskFilters();

  const actions = useActions();

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
