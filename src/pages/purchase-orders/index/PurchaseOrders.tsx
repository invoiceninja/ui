/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllPurchaseOrderColumns,
  usePurchaseOrderColumns,
  usePurchaseOrderFilters,
} from '../common/hooks';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';

export default function PurchaseOrders() {
  const { documentTitle } = useTitle('purchase_orders');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const pages: Page[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
  ];

  const columns = usePurchaseOrderColumns();

  const filters = usePurchaseOrderFilters();

  const actions = useActions();

  const purchaseOrderColumns = useAllPurchaseOrderColumns();

  const customBulkActions = useCustomBulkActions();

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default title={documentTitle} breadcrumbs={pages} withoutBackButton>
      <DataTable
        resource="purchase_order"
        endpoint="/api/v1/purchase_orders?include=vendor,expense&without_deleted_vendors=true&sort=id|desc"
        bulkRoute="/api/v1/purchase_orders/bulk"
        linkToCreate="/purchase_orders/create"
        linkToEdit="/purchase_orders/:id/edit"
        columns={columns}
        customActions={actions}
        customBulkActions={customBulkActions}
        customFilters={filters}
        customFilterPlaceholder="status"
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={purchaseOrderColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="purchaseOrder"
          />
        }
        linkToCreateGuards={[permission('create_purchase_order')]}
        hideEditableOptions={!hasPermission('edit_purchase_order')}
      />

      <ChangeTemplateModal<PurchaseOrder>
        entity="purchase_order"
        entities={changeTemplateResources as PurchaseOrder[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(purchase_order) => `${t('number')}: ${purchase_order.number}`}
        bulkUrl="/api/v1/purchase_orders/bulk"
      />
    </Default>
  );
}
