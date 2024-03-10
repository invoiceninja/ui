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
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { enabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { or } from '$app/common/guards/guards/or';
import { assigned } from '$app/common/guards/guards/assigned';
import { lazy } from 'react';

const Vendors = lazy(() => import('$app/pages/vendors/index/Vendors'));
const Import = lazy(() => import('$app/pages/vendors/import/Import'));
const Vendor = lazy(() => import('$app/pages/vendors/Vendor'));
const PurchaseOrders = lazy(
  () => import('$app/pages/vendors/show/pages/PurchaseOrders')
);
const Expenses = lazy(() => import('$app/pages/vendors/show/pages/Expenses'));
const RecurringExpenses = lazy(
  () => import('$app/pages/vendors/show/pages/RecurringExpenses')
);
const Documents = lazy(() => import('$app/pages/vendors/show/pages/Documents'));
const Edit = lazy(() => import('$app/pages/vendors/edit/Edit'));
const Create = lazy(() => import('$app/pages/vendors/create/Create'));

export const vendorRoutes = (
  <Route path="vendors">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Vendors),
            or(
              permission('view_vendor'),
              permission('create_vendor'),
              permission('edit_vendor')
            ),
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
            or(
              permission('view_vendor'),
              permission('edit_vendor'),
              assigned('/api/v1/vendors/:id')
            ),
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
