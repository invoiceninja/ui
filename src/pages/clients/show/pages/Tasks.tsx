/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { DataTable } from 'components/DataTable';
import { useTaskColumns, useTaskFilters } from 'pages/tasks/common/hooks';
import { useParams } from 'react-router-dom';

export const dataTableStaleTime = 50;

export function Tasks() {
  const { id } = useParams();

  const columns = useTaskColumns();

  const filters = useTaskFilters();

  return (
    <DataTable
      resource="task"
      endpoint={route('/api/v1/tasks?client_id=:id', { id })}
      columns={columns}
      customFilters={filters}
      customFilterQueryKey="client_status"
      customFilterPlaceholder="status"
      withResourcefulActions
      bulkRoute="/api/v1/tasks/bulk"
      linkToCreate={route('/tasks/create?client=:id', { id })}
      linkToEdit="/tasks/:id/edit"
      staleTime={dataTableStaleTime}
    />
  );
}
