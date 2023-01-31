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
import { enabled } from 'common/guards/guards/enabled';
import { permission } from 'common/guards/guards/permission';
import { ModuleBitmask } from 'pages/settings/account-management/component';
import { Route } from 'react-router-dom';
import { Create } from './create/Create';
import { Edit } from './edit/Edit';
import { Email } from './email/Email';
import { PurchaseOrders } from './index/PurchaseOrders';
import { Pdf } from './pdf/Pdf';

export const purchaseOrderRoutes = (
  <Route path="/purchase_orders">
    <Route
      path=""
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.PurchaseOrders),
            () =>
              permission('view_purchase_order') ||
              permission('view_purchase_order') ||
              permission('edit_purchase_order'),
          ]}
          component={<PurchaseOrders />}
        />
      }
    />
    <Route path=":id">
      <Route
        path="edit"
        element={
          <Guard
            guards={[
              () => enabled(ModuleBitmask.PurchaseOrders),
              () => permission('view_purchase_order') || permission('edit_purchase_order'),
            ]}
            component={<Edit />}
          />
        }
      />
      <Route
        path="email"
        element={
          <Guard
            guards={[
              () => enabled(ModuleBitmask.PurchaseOrders),
              () => permission('view_purchase_order'),
            ]}
            component={<Email />}
          />
        }
      />
      <Route
        path="pdf"
        element={
          <Guard
            guards={[
              () => enabled(ModuleBitmask.PurchaseOrders),
              () => permission('view_purchase_order'),
            ]}
            component={<Pdf />}
          />
        }
      />
    </Route>
    <Route
      path="create"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.PurchaseOrders),
            () => permission('create_purchase_order'),
          ]}
          component={<Create />}
        />
      }
    />
  </Route>
);
