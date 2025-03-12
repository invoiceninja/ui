/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { permission } from '$app/common/guards/guards/permission';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { DataTable } from '$app/components/DataTable';
import {
  useActions,
  usePurchaseOrderColumns,
  usePurchaseOrderFilters,
} from '$app/pages/purchase-orders/common/hooks';
import { useCustomBulkActions } from '$app/pages/purchase-orders/common/hooks/useCustomBulkActions';
import { useParams } from 'react-router-dom';

export default function PurchaseOrders() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const columns = usePurchaseOrderColumns();

  const filters = usePurchaseOrderFilters();

  const actions = useActions();

  const customBulkActions = useCustomBulkActions();

  return (
    <DataTable
      resource="purchase_order"
      endpoint={route(
        '/api/v1/purchase_orders?include=vendor,expense&vendor_id=:id&sort=id|desc',
        {
          id,
        }
      )}
      columns={columns}
      customFilters={filters}
      customActions={actions}
      customBulkActions={customBulkActions}
      customFilterPlaceholder="status"
      withResourcefulActions
      bulkRoute="/api/v1/purchase_orders/bulk"
      linkToCreate={route('/purchase_orders/create?vendor=:id', { id })}
      linkToEdit="/purchase_orders/:id/edit"
      excludeColumns={['vendor_id']}
      linkToCreateGuards={[permission('create_purchase_order')]}
      hideEditableOptions={!hasPermission('edit_purchase_order')}
    />
  );
}
