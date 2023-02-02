/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from 'common/guards/Guard';
import { assigned } from 'common/guards/guards/assigned';
import { or } from 'common/guards/guards/or';
import { permission } from 'common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { Create } from './create/Create';
import { Documents } from './documents/Documents';
import { Edit } from './edit/Edit';
import { ProductFields } from './edit/ProductFields';
import { Import } from './import/Import';
import { Products } from './index/Products';
import { Product } from './Product';
import { Show } from './show/Show';

export const productRoutes = (
  <Route path="products">
    <Route
      path=""
      element={
        <Guard
          guards={[() => or('view_product', 'create_product', 'edit_product')]}
          component={<Products />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[() => or('create_product', 'edit_product')]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_product')]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[() => or('view_product', 'edit_product')]}
          component={<Product />}
        />
      }
    >
      <Route path="product_fields" element={<ProductFields />} />
      <Route path="" element={<Show />} />
      <Route path="documents" element={<Documents />} />
    </Route>
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[
            () =>
              assigned({
                endpoint: '/api/v1/products/:id',
                permissions: ['edit_product'],
              }),
          ]}
          component={<Product />}
        />
      }
    >
      <Route path="" element={<Edit />} />
    </Route>
  </Route>
);
