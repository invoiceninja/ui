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
import { Route } from 'react-router-dom';
import { lazy } from 'react';

const Import = lazy(
  () => import('$app/pages/recurring-invoices/import/Import')
);
const RecurringInvoices = lazy(
  () => import('$app/pages/recurring-invoices/index/RecurringInvoices')
);
const RecurringInvoice = lazy(
  () => import('$app/pages/recurring-invoices/RecurringInvoice')
);
const Create = lazy(
  () => import('$app/pages/recurring-invoices/create/Create')
);
const CreatePage = lazy(
  () => import('$app/pages/recurring-invoices/create/components/CreatePage')
);
const Documents = lazy(
  () => import('$app/pages/recurring-invoices/edit/components/Documents')
);
const Settings = lazy(
  () => import('$app/pages/recurring-invoices/edit/components/Settings')
);
const Activities = lazy(
  () => import('$app/pages/recurring-invoices/edit/components/Activities')
);
const History = lazy(
  () => import('$app/pages/recurring-invoices/edit/components/History')
);
const Schedule = lazy(
  () => import('$app/pages/recurring-invoices/edit/components/Schedule')
);
const Edit = lazy(() => import('$app/pages/recurring-invoices/edit/Edit'));
const Pdf = lazy(() => import('$app/pages/recurring-invoices/pdf/Pdf'));
const EInvoice = lazy(
  () => import('$app/pages/recurring-invoices/edit/components/EInvoice')
);

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
    >
      <Route path="" element={<CreatePage />} />
      <Route path="documents" element={<Documents />} />
      <Route path="settings" element={<Settings />} />
    </Route>

    <Route
      path=":id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.RecurringInvoices),
            or(
              permission('view_recurring_invoice'),
              permission('edit_recurring_invoice'),
              assigned('/api/v1/recurring_invoices/:id')
            ),
          ]}
          component={<RecurringInvoice />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="e_invoice" element={<EInvoice />} />
      <Route path="documents" element={<Documents />} />
      <Route path="settings" element={<Settings />} />
      <Route path="activity" element={<Activities />} />
      <Route path="history" element={<History />} />
      <Route path="schedule" element={<Schedule />} />
    </Route>

    <Route
      path=":id/pdf"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.RecurringInvoices),
            or(
              permission('edit_recurring_invoice'),
              assigned('/api/v1/recurring_invoices/:id')
            ),
          ]}
          component={<Pdf />}
        />
      }
    />

    <Route
      path="import"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Invoices),
            or(
              permission('create_recurring_invoice'),
              permission('edit_recurring_invoice')
            ),
          ]}
          component={<Import />}
        />
      }
    />
  </Route>
);
