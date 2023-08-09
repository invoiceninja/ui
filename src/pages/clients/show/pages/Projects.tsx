/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { DataTable } from '$app/components/DataTable';
import { useParams } from 'react-router-dom';
import { dataTableStaleTime } from './Invoices';
import {
  useActions,
  useProjectColumns,
} from '$app/pages/projects/common/hooks';

export default function Projects() {
  const { id } = useParams();

  const columns = useProjectColumns();

  const actions = useActions();

  return (
    <DataTable
      resource="project"
      endpoint={route(
        '/api/v1/projects?include=client&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      customActions={actions}
      withResourcefulActions
      bulkRoute="/api/v1/projects/bulk"
      linkToCreate={route('/projects/create?client=:id', { id: id })}
      linkToEdit="/projects/:id/edit"
      staleTime={dataTableStaleTime}
    />
  );
}
