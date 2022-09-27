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
import { RecurringInvoices } from './index/RecurringInvoices';
import { Pdf } from './pdf/Pdf';

export const recurringInvoiceRoutes = (
  <Route path="/recurring_invoices">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_recurring_invoice')]}
          component={<RecurringInvoices />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_recurring_invoice')]}
          component={<Create />}
        />
      }
    />
    <Route path=":id">
      <Route
        path="edit"
        element={
          <Guard
            guards={[() => permission('edit_recurring_invoice')]}
            component={<Edit />}
          />
        }
      />
      <Route
        path="pdf"
        element={
          <Guard
            guards={[() => permission('view_recurring_invoice')]}
            component={<Pdf />}
          />
        }
      />
    </Route>
  </Route>
);
