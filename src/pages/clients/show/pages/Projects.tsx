/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { permission } from '$app/common/guards/guards/permission';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { DataTable } from '$app/components/DataTable';
import {
  defaultColumns,
  useActions,
  useCustomBulkActions,
  useProjectColumns,
  useProjectFilterColumns,
} from '$app/pages/projects/common/hooks';

export default function Projects() {
  const { id } = useParams();

  const hasPermission = useHasPermission();
  const reactSettings = useReactSettings();

  const selectedColumns =
    reactSettings?.react_table_columns?.project || defaultColumns;
  const shouldShowTagFilter = selectedColumns.includes('tags');

  const columns = useProjectColumns();
  const filterColumns = useProjectFilterColumns({
    enabled: shouldShowTagFilter,
  });

  const actions = useActions();

  const customBulkActions = useCustomBulkActions();

  const include = useMemo(
    () => (shouldShowTagFilter ? 'client,tags' : 'client'),
    [shouldShowTagFilter]
  );

  return (
    <DataTable
      resource="project"
      endpoint={route(
        '/api/v1/projects?include=:include&client_id=:id&sort=id|desc',
        { id, include }
      )}
      columns={columns}
      customActions={actions}
      customBulkActions={customBulkActions}
      filterColumns={shouldShowTagFilter ? filterColumns : undefined}
      withResourcefulActions
      bulkRoute="/api/v1/projects/bulk"
      linkToCreate={route('/projects/create?client=:id', { id: id })}
      linkToEdit="/projects/:id/edit"
      excludeColumns={['client_id']}
      linkToCreateGuards={[permission('create_project')]}
      hideEditableOptions={!hasPermission('edit_project')}
      withoutPageAsPreference
      withoutStoringSearchFilter
    />
  );
}
