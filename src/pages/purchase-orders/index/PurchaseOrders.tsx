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
import { DataTable, filterColumnsValuesAtom } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllPurchaseOrderColumns,
  usePurchaseOrderColumns,
  usePurchaseOrderFilterColumns,
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
import { useDateRangeColumns } from '../common/hooks/useDateRangeColumns';
import { InputLabel } from '$app/components/forms';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { ImportButton } from '$app/components/import/ImportButton';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import {
  PurchaseOrderSlider,
  purchaseOrderSliderAtom,
  purchaseOrderSliderVisibilityAtom,
} from '../common/components/PurchaseOrderSlider';
import { useAtom } from 'jotai';
import { usePurchaseOrderQuery } from '$app/common/queries/purchase-orders';
import { useEffect, useState } from 'react';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';

export default function PurchaseOrders() {
  const { documentTitle } = useTitle('purchase_orders');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const pages: Page[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
  ];

  const actions = useActions();
  const reactSettings = useReactSettings();
  const filters = usePurchaseOrderFilters();
  const columns = usePurchaseOrderColumns();
  const dateRangeColumns = useDateRangeColumns();
  const customBulkActions = useCustomBulkActions();
  const purchaseOrderColumns = useAllPurchaseOrderColumns();

  const selectedColumns =
    reactSettings?.react_table_columns?.purchaseOrder || defaultColumns;
  const shouldShowTagFilter = selectedColumns.includes('tags');
  const filterColumns = usePurchaseOrderFilterColumns({
    enabled: shouldShowTagFilter,
  });

  const [filterColumnsValues, setFilterColumnsValues] = useAtom(
    filterColumnsValuesAtom
  );

  useEffect(() => {
    if (
      !shouldShowTagFilter &&
      filterColumnsValues.purchase_order_tag_ids?.length
    ) {
      setFilterColumnsValues((current) => {
        const { purchase_order_tag_ids, ...rest } = current;

        return rest;
      });
    }
  }, [
    shouldShowTagFilter,
    filterColumnsValues.purchase_order_tag_ids,
    setFilterColumnsValues,
  ]);
  const disableNavigation = useDisableNavigation();

  const [sliderPurchaseOrderId, setSliderPurchaseOrderId] =
    useState<string>('');
  const [purchaseOrderSlider, setPurchaseOrderSlider] = useAtom(
    purchaseOrderSliderAtom
  );
  const [purchaseOrderSliderVisibility, setPurchaseOrderSliderVisibility] =
    useAtom(purchaseOrderSliderVisibilityAtom);

  const { data: purchaseOrderResponse } = usePurchaseOrderQuery({
    id: sliderPurchaseOrderId,
  });

  useEffect(() => {
    setPurchaseOrderSlider(null);
  }, [sliderPurchaseOrderId]);

  useEffect(() => {
    if (purchaseOrderResponse && purchaseOrderSliderVisibility) {
      setPurchaseOrderSlider(purchaseOrderResponse);
    }
  }, [purchaseOrderResponse, purchaseOrderSliderVisibility]);

  useEffect(() => {
    return () => setPurchaseOrderSliderVisibility(false);
  }, []);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="purchase_order"
        endpoint={`/api/v1/purchase_orders?include=vendor,expense${
          shouldShowTagFilter ? ',tags' : ''
        }&without_deleted_vendors=true&sort=id|desc${
          shouldShowTagFilter ? '' : '&tag_ids='
        }`}
        bulkRoute="/api/v1/purchase_orders/bulk"
        linkToCreate="/purchase_orders/create"
        linkToEdit="/purchase_orders/:id/edit"
        columns={columns}
        customActions={actions}
        customBulkActions={customBulkActions}
        customFilters={filters}
        customFilterPlaceholder="status"
        filterColumns={shouldShowTagFilter ? filterColumns : undefined}
        withResourcefulActions
        rightSide={
          <div className="flex items-center space-x-2">
            <DataTableColumnsPicker
              columns={purchaseOrderColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="purchaseOrder"
            />

            <Guard
              type="component"
              guards={[
                or(
                  permission('create_purchase_order'),
                  permission('edit_purchase_order')
                ),
              ]}
              component={<ImportButton route="/purchase_orders/import" />}
            />
          </div>
        }
        dateRangeColumns={dateRangeColumns}
        linkToCreateGuards={[permission('create_purchase_order')]}
        hideEditableOptions={!hasPermission('edit_purchase_order')}
        onTableRowClick={(purchaseOrder) => {
          setSliderPurchaseOrderId(purchaseOrder.id);
          setPurchaseOrderSliderVisibility(true);
        }}
        enableSavingFilterPreference
        enableSavingLatestDataForNavigation
      />

      {!disableNavigation('purchase_order', purchaseOrderSlider) && (
        <PurchaseOrderSlider />
      )}

      <ChangeTemplateModal<PurchaseOrder>
        entity="purchase_order"
        entities={changeTemplateResources as PurchaseOrder[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(purchase_order) => (
          <div className="flex flex-col space-y-1">
            <InputLabel>{t('number')}</InputLabel>

            <span>{purchase_order.number}</span>
          </div>
        )}
        bulkLabelFn={(purchase_order) => (
          <div className="flex space-x-2">
            <InputLabel>{t('number')}:</InputLabel>

            <span>{purchase_order.number}</span>
          </div>
        )}
        bulkUrl="/api/v1/purchase_orders/bulk"
      />
    </Default>
  );
}
