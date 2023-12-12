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
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import {
  defaultColumns,
  useActions,
  useAllProductColumns,
  useProductColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ImportButton } from '$app/components/import/ImportButton';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export default function Products() {
  useTitle('products');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const pages: Page[] = [{ name: t('products'), href: '/products' }];

  const productColumns = useAllProductColumns();

  const columns = useProductColumns();

  const actions = useActions();

  const customBulkActions = useCustomBulkActions();

  return (
    <Default
      title={t('products')}
      breadcrumbs={pages}
      docsLink="en/products"
      withoutBackButton
    >
      <DataTable
        resource="product"
        columns={columns}
        endpoint="/api/v1/products?include=company&sort=id|desc"
        bulkRoute="/api/v1/products/bulk"
        linkToCreate="/products/create"
        linkToEdit="/products/:id/edit"
        withResourcefulActions
        customActions={actions}
        customBulkActions={customBulkActions}
        rightSide={
          <Guard
            type="component"
            guards={[
              or(permission('create_product'), permission('edit_product')),
            ]}
            component={<ImportButton route="/products/import" />}
          />
        }
        leftSideChevrons={
          <DataTableColumnsPicker
            table="product"
            columns={productColumns as unknown as string[]}
            defaultColumns={defaultColumns}
          />
        }
        linkToCreateGuards={[permission('create_product')]}
        hideEditableOptions={!hasPermission('edit_product')}
      />
    </Default>
  );
}
