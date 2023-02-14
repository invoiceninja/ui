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
import { Documents } from './show/pages/Documents';
import { Expenses } from './show/pages/Expenses';
import { PurchaseOrders } from './show/pages/PurchaseOrders';
import { RecurringExpenses } from './show/pages/RecurringExpenses';
import { Vendor } from './Vendor';
import { Import } from 'pages/vendors/import/Import';
import { enabled } from 'common/guards/guards/enabled';
import { ModuleBitmask } from 'pages/settings/account-management/component';
import { or } from 'common/guards/guards/or';
import { assigned } from 'common/guards/guards/assigned';

export const vendorRoutes = (
  <Route path="vendors">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Vendors),
            or(permission('view_vendor'), permission('create_vendor')),
          ]}
          component={<Vendors />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Vendors),
            or(permission('create_vendor'), permission('edit_vendor')),
          ]}
          component={<Import />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Vendors),
            or(permission('view_vendor'), assigned('/api/v1/vendors/:id')),
          ]}
          component={<Vendor />}
        />
      }
    >
      <Route path="" element={<PurchaseOrders />} />
      <Route path="purchase_orders" element={<PurchaseOrders />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="recurring_expenses" element={<RecurringExpenses />} />
      <Route path="documents" element={<Documents />} />
    </Route>
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Vendors),
            or(permission('edit_vendor'), assigned('/api/v1/vendors/:id')),
          ]}
          component={<Edit />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[enabled(ModuleBitmask.Vendors), permission('create_vendor')]}
          component={<Create />}
        />
      }
    />
  </Route>
);
