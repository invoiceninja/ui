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
import { useTitle } from 'common/hooks/useTitle';
import { Page } from 'components/Breadcrumbs';
import { DataTable } from 'components/DataTable';
import { useNavigate } from 'react-router-dom';
import { Default } from 'components/layouts/Default';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Product } from 'common/interfaces/product';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';
import { route } from 'common/helpers/route';
import {
  defaultColumns,
  productColumns,
  useProductColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';

export function Products() {
  useTitle('products');

  const [t] = useTranslation();

  const navigate = useNavigate();

  const pages: Page[] = [{ name: t('products'), href: '/products' }];

  const importButton = (
    <ReactRouterLink to="/products/import">
      <button className="inline-flex items-center justify-center py-2 px-4 rounded text-sm text-white bg-green-500 hover:bg-green-600">
        <svg
          className="w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="3 3 20 20"
        >
          <Download />
        </svg>
        <span>{t('import')}</span>
      </button>
    </ReactRouterLink>
  );

  const actions = [
    (product: Product) => (
      <DropdownElement
        onClick={() =>
          navigate(route('/products/:id/clone', { id: product.id }))
        }
      >
        {t('clone')}
      </DropdownElement>
    ),
  ];

  const columns = useProductColumns();

  return (
    <Default title={t('products')} breadcrumbs={pages} docsLink="docs/products">
      <DataTable
        resource="product"
        columns={columns}
        endpoint="/api/v1/products?include=company"
        bulkRoute="/api/v1/products/bulk"
        linkToCreate="/products/create"
        linkToEdit="/products/:id/edit"
        withResourcefulActions
        customActions={actions}
        rightSide={importButton}
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
