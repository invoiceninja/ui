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
import { permission } from 'common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { Create } from './create/Create';
import { Edit } from './edit/Edit';
import { Vendors } from './index/Vendors';
import { Expenses } from './show/pages/Expenses';
import { PurchaseOrders } from './show/pages/PurchaseOrders';
import { RecurringExpenses } from './show/pages/RecurringExpenses';
import { Vendor } from './Vendor';

export const vendorRoutes = (
  <Route path="vendors">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_vendor')]}
          component={<Vendors />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[() => permission('view_vendor')]}
          component={<Vendor />}
        />
      }
    >
      <Route path="" element={<PurchaseOrders />} />
      <Route path="purchase_orders" element={<PurchaseOrders />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="recurring_expenses" element={<RecurringExpenses />} />
    </Route>
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[() => permission('edit_vendor')]}
          component={<Edit />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_vendor')]}
          component={<Create />}
        />
      }
    />
  </Route>
);
