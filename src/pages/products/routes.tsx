/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from '$app/common/guards/Guard';
import { assigned } from '$app/common/guards/guards/assigned';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { admin } from '$app/common/guards/guards/admin';

const Product = lazy(() => import('$app/pages/products/Product'));
const Import = lazy(() => import('$app/pages/products/import/Import'));
const Products = lazy(() => import('$app/pages/products/index/Products'));
const Create = lazy(() => import('$app/pages/products/create/Create'));
const Edit = lazy(() => import('$app/pages/products/edit/Edit'));
const Show = lazy(() => import('$app/pages/products/show/Show'));
const Documents = lazy(() => import('$app/pages/products/documents/Documents'));
const ProductFields = lazy(
  () => import('$app/pages/products/edit/ProductFields')
);

export const productRoutes = (
  <Route path="products">
    <Route
      path=""
      element={
        <Guard
          guards={[
            or(
              permission('view_product'),
              permission('create_product'),
              permission('edit_product')
            ),
          ]}
          component={<Products />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            or(permission('create_product'), permission('edit_product')),
          ]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard guards={[permission('create_product')]} component={<Create />} />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            or(
              permission('view_product'),
              permission('edit_product'),
              assigned('/api/v1/products/:id')
            ),
          ]}
          component={<Product />}
        />
      }
    >
      <Route path="" element={<Show />} />
      <Route path="documents" element={<Documents />} />
    </Route>

    <Route
      path=":id"
      element={<Guard guards={[admin()]} component={<Product />} />}
    >
      <Route path="product_fields" element={<ProductFields />} />
    </Route>

    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[
            or(
              permission('view_product'),
              permission('edit_product'),
              assigned('/api/v1/products/:id')
            ),
          ]}
          component={<Product />}
        />
      }
    >
      <Route path="" element={<Edit />} />
    </Route>
  </Route>
);
