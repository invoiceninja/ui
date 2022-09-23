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
import { Route } from 'react-router-dom';
import { Email } from './email/Email';
import { Invoices } from './index/Invoices';
import { Pdf } from './pdf/Pdf';
import { Create } from './create/Create';
import { Edit } from './edit/Edit';

export const invoiceRoutes = (
  <Route path="/invoices">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_invoice')]}
          component={<Invoices />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            () => permission('create_invoice') || permission('edit_invoice'),
          ]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_invoice')]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[
            () => permission('view_invoice'),
            () => permission('edit_invoice'),
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
    {/* <Route path=":id/clone/quote" element={<CloneInvoiceToQuote />} />
    <Route path=":id/clone/credit" element={<CloneInvoiceToCredit />} />
    <Route
      path=":id/clone/recurring_invoice"
      element={<CloneInvoiceToRecurringInvoice />}
    /> */}
  </Route>
);
