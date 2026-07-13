/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable, filterColumnsValuesAtom } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import {
  defaultColumns,
  useActions,
  useAllProductColumns,
  useProductColumns,
  useProductFilterColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ImportButton } from '$app/components/import/ImportButton';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useProductQuery } from '$app/common/queries/products';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import {
  ProductSlider,
  productSliderAtom,
  productSliderVisibilityAtom,
} from '../common/components/ProductSlider';

export default function Products() {
  useTitle('products');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const pages: Page[] = [{ name: t('products'), href: '/products' }];

  const productColumns = useAllProductColumns();

  const columns = useProductColumns();

  const actions = useActions();

  const reactSettings = useReactSettings();

  const customBulkActions = useCustomBulkActions();

  const selectedColumns =
    reactSettings?.react_table_columns?.product || defaultColumns;
  const shouldShowTagFilter = selectedColumns.includes('tags');
  const filterColumns = useProductFilterColumns({
    enabled: shouldShowTagFilter,
  });

  const [filterColumnsValues, setFilterColumnsValues] = useAtom(
    filterColumnsValuesAtom
  );

  useEffect(() => {
    if (!shouldShowTagFilter && filterColumnsValues.product_tag_ids?.length) {
      setFilterColumnsValues((current) => {
        const { product_tag_ids, ...rest } = current;

        return rest;
      });
    }
  }, [
    shouldShowTagFilter,
    filterColumnsValues.product_tag_ids,
    setFilterColumnsValues,
  ]);

  const [sliderProductId, setSliderProductId] = useState<string>('');
  const [productSlider, setProductSlider] = useAtom(productSliderAtom);
  const [productSliderVisibility, setProductSliderVisibility] = useAtom(
    productSliderVisibilityAtom
  );

  const { data: productResponse } = useProductQuery({ id: sliderProductId });

  useEffect(() => {
    if (sliderProductId) {
      setProductSlider(null);
    }
  }, [sliderProductId]);

  useEffect(() => {
    if (productResponse && productSliderVisibility) {
      setProductSlider(productResponse.data.data);
    }
  }, [productResponse, productSliderVisibility]);

  useEffect(() => {
    return () => setProductSliderVisibility(false);
  }, []);

  return (
    <Default title={t('products')} breadcrumbs={pages} docsLink="en/products">
      <DataTable
        resource="product"
        columns={columns}
        endpoint={`/api/v1/products?include=company${
          shouldShowTagFilter ? ',tags' : ''
        }&sort=id|desc${shouldShowTagFilter ? '' : '&tag_ids='}`}
        bulkRoute="/api/v1/products/bulk"
        linkToCreate="/products/create"
        linkToEdit="/products/:id/edit"
        withResourcefulActions
        customActions={actions}
        customBulkActions={customBulkActions}
        filterColumns={shouldShowTagFilter ? filterColumns : undefined}
        rightSide={
          <div className="flex items-center space-x-2">
            <DataTableColumnsPicker
              table="product"
              columns={productColumns as unknown as string[]}
              defaultColumns={defaultColumns}
            />

            <Guard
              type="component"
              guards={[
                or(permission('create_product'), permission('edit_product')),
              ]}
              component={<ImportButton route="/products/import" />}
            />
          </div>
        }
        linkToCreateGuards={[permission('create_product')]}
        hideEditableOptions={!hasPermission('edit_product')}
        onTableRowClick={(product) => {
          setSliderProductId(product.id);
          setProductSliderVisibility(true);
        }}
        enableSavingFilterPreference
        dateRangeColumns={[
          { column: 'created_at', queryParameterKey: 'created_between' },
        ]}
        enableSavingLatestDataForNavigation
      />

      {!disableNavigation('product', productSlider) && <ProductSlider />}
    </Default>
  );
}
