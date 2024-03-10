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
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { lazy } from 'react';

const Clients = lazy(() => import('$app/pages/clients/index/Clients'));
const Import = lazy(() => import('$app/pages/clients/import/Import'));
const Create = lazy(() => import('$app/pages/clients/create/Create'));
const Edit = lazy(() => import('$app/pages/clients/edit/Edit'));
const Client = lazy(() => import('$app/pages/clients/show/Client'));
const Quotes = lazy(() => import('$app/pages/clients/show/pages/Quotes'));
const Payments = lazy(() => import('$app/pages/clients/show/pages/Payments'));
const RecurringInvoices = lazy(
  () => import('$app/pages/clients/show/pages/RecurringInvoices')
);
const Credits = lazy(() => import('$app/pages/clients/show/pages/Credits'));
const Projects = lazy(() => import('$app/pages/clients/show/pages/Projects'));
const Tasks = lazy(() => import('$app/pages/clients/show/pages/Tasks'));
const Expenses = lazy(() => import('$app/pages/clients/show/pages/Expenses'));
const RecurringExpenses = lazy(
  () => import('$app/pages/clients/show/pages/RecurringExpenses')
);
const Statement = lazy(() => import('$app/pages/clients/statement/Statement'));
const Invoices = lazy(() => import('$app/pages/clients/show/pages/Invoices'));
const Activities = lazy(
  () => import('$app/pages/clients/show/pages/Activities')
);
const Documents = lazy(() => import('$app/pages/clients/show/pages/Documents'));

export const clientRoutes = (
  <Route path="clients">
    <Route
      path=""
      element={
        <Guard
          guards={[
            or(
              permission('view_client'),
              permission('create_client'),
              permission('edit_client')
            ),
          ]}
          component={<Clients />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[or(permission('create_client'), permission('edit_client'))]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard guards={[permission('create_client')]} component={<Create />} />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[
            or(permission('edit_client'), assigned('/api/v1/clients/:id')),
          ]}
          component={<Edit />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            or(
              permission('view_client'),
              permission('edit_client'),
              assigned('/api/v1/clients/:id')
            ),
          ]}
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
      <Route path="activities" element={<Activities />} />
      <Route path="documents" element={<Documents />} />
    </Route>
    <Route
      path=":id/statement"
      element={
        <Guard
          guards={[
            or(permission('edit_client'), assigned('/api/v1/clients/:id')),
          ]}
          component={<Statement />}
        />
      }
    />
  </Route>
);
