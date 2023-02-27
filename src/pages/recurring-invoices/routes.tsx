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
import { enabled } from 'common/guards/guards/enabled';
import { or } from 'common/guards/guards/or';
import { permission } from 'common/guards/guards/permission';
import { ModuleBitmask } from 'pages/settings/account-management/component';
import { Route } from 'react-router-dom';
import { Create } from './create/Create';
import { Edit } from './edit/Edit';
import { RecurringInvoices } from './index/RecurringInvoices';
import { Pdf } from './pdf/Pdf';

export const recurringInvoiceRoutes = (
  <Route path="/recurring_invoices">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.RecurringInvoices),
            or(
              permission('view_recurring_invoice'),
              permission('create_recurring_invoice'),
              permission('edit_recurring_invoice')
            ),
          ]}
          component={<RecurringInvoices />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.RecurringInvoices),
            permission('create_recurring_invoice'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route path=":id">
      <Route
        path="edit"
        element={
          <Guard
            guards={[
              enabled(ModuleBitmask.RecurringInvoices),
              or(
                permission('edit_recurring_invoice'),
                assigned('/api/v1/recurring_invoices/:id')
              ),
            ]}
            component={<Edit />}
          />
        }
      />
      <Route
        path="pdf"
        element={
          <Guard
            guards={[
              enabled(ModuleBitmask.RecurringInvoices),
              permission('view_recurring_invoice'),
            ]}
            component={<Pdf />}
          />
        }
      />
    </Route>
  </Route>
);
