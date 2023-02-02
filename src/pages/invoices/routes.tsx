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
import { Import } from 'pages/invoices/import/Import';
import { Outlet, Route } from 'react-router-dom';
import { Email } from './email/Email';
import { Invoices } from './index/Invoices';
import { Pdf } from './pdf/Pdf';
import { Create } from './create/Create';
import { Edit } from './edit/Edit';
import { enabled } from 'common/guards/guards/enabled';
import { ModuleBitmask } from 'pages/settings/account-management/component';
import { or } from 'common/guards/guards/or';
import { assigned } from 'common/guards/guards/assigned';

export const invoiceRoutes = (
  <Route
    path="/invoices"
    element={
      <Guard
        guards={[() => enabled(ModuleBitmask.Invoices)]}
        component={<Outlet />}
      />
    }
  >
    <Route
      path=""
      element={
        <Guard
          guards={[() => or('view_invoice', 'create_invoice', 'edit_invoice')]}
          component={<Invoices />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[() => or('create_invoice', 'edit_invoice')]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard guards={[() => or('create_invoice')]} component={<Create />} />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[
            () =>
              assigned({
                endpoint: '/api/v1/invoices/:id',
                permissions: ['view_invoice', 'edit_invoice'],
              }),
          ]}
          component={<Edit />}
        />
      }
    />
    <Route
      path=":id/pdf"
      element={
        <Guard
          guards={[() => permission('view_invoice')]}
          component={<Pdf />}
        />
      }
    />
    <Route path=":id/email" element={<Email />} />
  </Route>
);
