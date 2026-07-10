/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useParams } from 'react-router-dom';
import { permission } from '$app/common/guards/guards/permission';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { DataTable } from '$app/components/DataTable';
import { useActions, useCreditColumns } from '$app/pages/credits/common/hooks';
import { useCreditsFilters } from '$app/pages/credits/common/hooks/useCreditsFilters';
import { useCustomBulkActions } from '$app/pages/credits/common/hooks/useCustomBulkActions';

export default function Credits() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const columns = useCreditColumns();

  const filters = useCreditsFilters();

  const actions = useActions();

  const customBulkActions = useCustomBulkActions();

  return (
    <DataTable
      resource="credit"
      endpoint={route(
        '/api/v1/credits?include=client&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      customActions={actions}
      customBulkActions={customBulkActions}
      customFilters={filters}
      customFilterPlaceholder="status"
      withResourcefulActions
      bulkRoute="/api/v1/credits/bulk"
      linkToCreate={route('/credits/create?client=:id', { id })}
      linkToEdit="/credits/:id/edit"
      excludeColumns={['client_id']}
      linkToCreateGuards={[permission('create_credit')]}
      hideEditableOptions={!hasPermission('edit_credit')}
      withoutPageAsPreference
      withoutStoringSearchFilter
    />
  );
}
