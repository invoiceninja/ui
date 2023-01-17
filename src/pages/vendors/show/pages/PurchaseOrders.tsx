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
import {
  usePurchaseOrderColumns,
  usePurchaseOrderFilters,
} from 'pages/purchase-orders/common/hooks';
import { useParams } from 'react-router-dom';

const dataTableStaleTime = 50;

export function PurchaseOrders() {
  const { id } = useParams();

  const columns = usePurchaseOrderColumns();

  const filters = usePurchaseOrderFilters();

  return (
    <DataTable
      resource="purchase_order"
      endpoint={route(
        '/api/v1/purchase_orders?include=vendor,expense&vendor_id=:id',
        {
          id,
        }
      )}
      columns={columns}
      customFilters={filters}
      customFilterQueryKey="client_status"
      customFilterPlaceholder="status"
      withResourcefulActions
      bulkRoute="/api/v1/purchase_orders/bulk"
      linkToCreate={route('/purchase_orders/create?vendor=:id', { id })}
      linkToEdit="/purchase_orders/:id/edit"
      staleTime={dataTableStaleTime}
    />
  );
}
