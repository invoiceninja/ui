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
import { enabled } from '$app/common/guards/guards/enabled';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { Outlet, Route } from 'react-router-dom';
import { lazy } from 'react';

const PurchaseOrders = lazy(() => import('./index/PurchaseOrders'));
const Edit = lazy(() => import('./edit/Edit'));
const Email = lazy(() => import('./email/Email'));
const Pdf = lazy(() => import('./pdf/Pdf'));
const Create = lazy(() => import('./create/Create'));

export const purchaseOrderRoutes = (
  <Route path="/purchase_orders">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.PurchaseOrders),
            or(
              permission('view_purchase_order'),
              permission('create_purchase_order'),
              permission('edit_purchase_order')
            ),
          ]}
          component={<PurchaseOrders />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.PurchaseOrders),
            or(
              permission('view_purchase_order'),
              permission('edit_purchase_order'),
              assigned('/api/v1/purchase_orders/:id')
            ),
          ]}
          component={<Outlet />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
    </Route>

    <Route
      path=":id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.PurchaseOrders),
            or(
              permission('edit_purchase_order'),
              assigned('/api/v1/purchase_orders/:id')
            ),
          ]}
          component={<Outlet />}
        />
      }
    >
      <Route path="email" element={<Email />} />
      <Route path="pdf" element={<Pdf />} />
    </Route>
    <Route
      path="create"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.PurchaseOrders),
            permission('create_purchase_order'),
          ]}
          component={<Create />}
        />
      }
    />
  </Route>
);
