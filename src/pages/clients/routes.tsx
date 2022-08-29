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
import { Import } from './import/Import';
import { Clients } from './index/Clients';
import { Client } from './show/Client';
import { Credits } from './show/pages/Credits';
import { Expenses } from './show/pages/Expenses';
import { Invoices } from './show/pages/Invoices';
import { Payments } from './show/pages/Payments';
import { Projects } from './show/pages/Projects';
import { Quotes } from './show/pages/Quotes';
import { RecurringExpenses } from './show/pages/RecurringExpenses';
import { RecurringInvoices } from './show/pages/RecurringInvoices';
import { Tasks } from './show/pages/Tasks';

export const clientRoutes = (
  <Route path="clients">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_client')]}
          component={<Clients />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[() => permission('create_client') || permission('edit_client')]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_client')]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[() => permission('edit_client')]}
          component={<Edit />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[() => permission('view_client')]}
          component={<Client />}
        />
      }
    >
      <Route path="" element={<Invoices />} />
      <Route path="quotes" element={<Quotes />} />
      <Route path="payments" element={<Payments />} />
      <Route path="recurring_invoices" element={<RecurringInvoices />} />
      <Route path="credits" element={<Credits />} />
      <Route path="projects" element={<Projects />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="recurring_expenses" element={<RecurringExpenses />} />
    </Route>
  </Route>
);
