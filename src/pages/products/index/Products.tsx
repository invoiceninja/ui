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

export function Products() {
  useTitle('products');

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('products'), href: '/products' }];

  const productColumns = useAllProductColumns();

  const columns = useProductColumns();

  const actions = useActions();

  return (
    <Default
      title={t('products')}
      breadcrumbs={pages}
      docsLink="docs/products"
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
        rightSide={<ImportButton route="/products/import" />}
        leftSideChevrons={
          <DataTableColumnsPicker
            table="product"
            columns={productColumns as unknown as string[]}
            defaultColumns={defaultColumns}
          />
        }
      />
    </Default>
  );
}
