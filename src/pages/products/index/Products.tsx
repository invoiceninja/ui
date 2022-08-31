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
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Link } from '@invoiceninja/forms';
import { generatePath, useNavigate } from 'react-router-dom';
import { Default } from 'components/layouts/Default';
import { EntityStatus } from 'components/EntityStatus';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { Product } from 'common/interfaces/product';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';

export function Products() {
  useTitle('products');

  const [t] = useTranslation();

  const navigate = useNavigate();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const pages: BreadcrumRecord[] = [{ name: t('products'), href: '/products' }];

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

  const columns: DataTableColumns<Product> = [
    {
      id: 'product_key',
      label: t('product_key'),
      format: (value, product) => (
        <span className="inline-flex items-center space-x-4">
          <EntityStatus entity={product} />

          <Link to={generatePath('/products/:id/edit', { id: product.id })}>
            {value}
          </Link>
        </span>
      ),
    },
    {
      id: 'notes',
      label: t('notes'),
    },
    {
      id: 'price',
      label: t('price'),
      format: (value, product) =>
        formatMoney(
          value,
          product.company?.settings.country_id || company.settings.country_id,
          product.company?.settings.currency_id || company.settings.currency_id
        ),
    },
    {
      id: 'quantity',
      label: t('quantity'),
    },
  ];

  const actions = [
    (product: Product) => (
      <DropdownElement
        onClick={() =>
          navigate(generatePath('/products/:id/clone', { id: product.id }))
        }
      >
        {t('clone')}
      </DropdownElement>
    ),
  ];

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
      />
    </Default>
  );
}
