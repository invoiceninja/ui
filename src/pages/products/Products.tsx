/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Default } from '../../components/layouts/Default';
import { BreadcrumRecord } from 'components/Breadcrumbs';
// import DataTable
import { DataTable, DataTableColumns } from 'components/DataTable';

// Products Component
export function Products() {
  const [t] = useTranslation();
  const pages: BreadcrumRecord[] = [{ name: t('products'), href: '/products' }];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('products')}`;
  });

  // Table columns for product page
  const columns: DataTableColumns = [
    {
      id: 'product_key',
      label: t('product_key'),
    },
    {
      id: 'notes',
      label: t('notes'),
    },
    {
      id: 'cost',
      label: t('cost'),
    },
  ];

  // ==== RETURN COMPONENT
  return (
    <Default title={t('products')} breadcrumbs={pages}>
      <DataTable
        resource="product"
        columns={columns}
        endpoint="/api/v1/products"
        linkToCreate="/products/create"
        linkToEdit="products/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
