/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Page } from 'components/Breadcrumbs';
import { DataTable } from 'components/DataTable';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  purchaseOrderColumns,
  usePurchaseOrderColumns,
  usePurchaseOrderFilters,
} from '../common/hooks';

export function PurchaseOrders() {
  const { documentTitle } = useTitle('purchase_orders');

  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
  ];

  const columns = usePurchaseOrderColumns();

  const filters = usePurchaseOrderFilters();

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="purchase_order"
        endpoint="/api/v1/purchase_orders?include=vendor,expense"
        bulkRoute="/api/v1/purchase_orders/bulk"
        linkToCreate="/purchase_orders/create"
        linkToEdit="/purchase_orders/:id/edit"
        columns={columns}
        customFilters={filters}
        customFilterQueryKey="client_status"
        customFilterPlaceholder="status"
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={purchaseOrderColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="purchaseOrder"
          />
        }
      />
    </Default>
  );
}
