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
import { lazy, Suspense } from 'react';
import { TabLoader } from '$app/components/TabLoader';

const Clients = lazy(() => import('$app/pages/clients/index/Clients'));
const Import = lazy(() => import('$app/pages/clients/import/Import'));
const Create = lazy(() => import('$app/pages/clients/create/Create'));
const Edit = lazy(() => import('$app/pages/clients/edit/Edit'));
const Client = lazy(() => import('$app/pages/clients/show/Client'));
const ClientEdit = lazy(() => import('$app/pages/clients/Client'));
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
const Settings = lazy(
  () => import('$app/pages/clients/common/components/Settings')
);
const EditPageDocuments = lazy(
  () => import('$app/pages/clients/common/components/Documents')
);
const Locations = lazy(
  () => import('$app/pages/clients/common/components/Locations')
);
const CreatePage = lazy(
  () => import('$app/pages/clients/create/ common/components/CreatePage')
);

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
    >
      <Route path="" element={<CreatePage />} />
      <Route path="settings" element={<Settings />} />
      <Route path="documents" element={<EditPageDocuments />} />
      <Route path="locations" element={<Locations />} />
    </Route>

    <Route
      path=":id"
      element={
        <Guard
          guards={[
            or(permission('edit_client'), assigned('/api/v1/clients/:id')),
          ]}
          component={<ClientEdit />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="settings" element={<Settings />} />
      <Route path="documents" element={<EditPageDocuments />} />
      <Route path="locations" element={<Locations />} />
    </Route>

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
      <Route
        path=""
        element={
          <Suspense fallback={<TabLoader />}>
            <Invoices />
          </Suspense>
        }
      />
      <Route
        path="quotes"
        element={
          <Suspense fallback={<TabLoader />}>
            <Quotes />
          </Suspense>
        }
      />
      <Route
        path="payments"
        element={
          <Suspense fallback={<TabLoader />}>
            <Payments />
          </Suspense>
        }
      />
      <Route
        path="recurring_invoices"
        element={
          <Suspense fallback={<TabLoader />}>
            <RecurringInvoices />
          </Suspense>
        }
      />
      <Route
        path="credits"
        element={
          <Suspense fallback={<TabLoader />}>
            <Credits />
          </Suspense>
        }
      />
      <Route
        path="projects"
        element={
          <Suspense fallback={<TabLoader />}>
            <Projects />
          </Suspense>
        }
      />
      <Route
        path="tasks"
        element={
          <Suspense fallback={<TabLoader />}>
            <Tasks />
          </Suspense>
        }
      />
      <Route
        path="expenses"
        element={
          <Suspense fallback={<TabLoader />}>
            <Expenses />
          </Suspense>
        }
      />
      <Route
        path="recurring_expenses"
        element={
          <Suspense fallback={<TabLoader />}>
            <RecurringExpenses />
          </Suspense>
        }
      />
      <Route
        path="activities"
        element={
          <Suspense fallback={<TabLoader />}>
            <Activities />
          </Suspense>
        }
      />
      <Route
        path="documents_overview"
        element={
          <Suspense fallback={<TabLoader />}>
            <Documents />
          </Suspense>
        }
      />
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
