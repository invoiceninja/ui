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
import {
  useActions,
  useCustomBulkActions,
  useProjectColumns,
} from '$app/pages/projects/common/hooks';
import { permission } from '$app/common/guards/guards/permission';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export default function Projects() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const columns = useProjectColumns();

  const actions = useActions();

  const customBulkActions = useCustomBulkActions();

  return (
    <DataTable
      resource="project"
      endpoint={route(
        '/api/v1/projects?include=client&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      customActions={actions}
      customBulkActions={customBulkActions}
      withResourcefulActions
      bulkRoute="/api/v1/projects/bulk"
      linkToCreate={route('/projects/create?client=:id', { id: id })}
      linkToEdit="/projects/:id/edit"
      excludeColumns={['client_id']}
      linkToCreateGuards={[permission('create_project')]}
      hideEditableOptions={!hasPermission('edit_project')}
    />
  );
}
