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
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { enabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { or } from '$app/common/guards/guards/or';
import { assigned } from '$app/common/guards/guards/assigned';
import { lazy } from 'react';

const Invoices = lazy(() => import('$app/pages/invoices/index/Invoices'));
const Invoice = lazy(() => import('$app/pages/invoices/Invoice'));
const Import = lazy(() => import('$app/pages/invoices/import/Import'));
const Create = lazy(() => import('$app/pages/invoices/create/Create'));
const Edit = lazy(() => import('$app/pages/invoices/edit/Edit'));
const Pdf = lazy(() => import('$app/pages/invoices/pdf/Pdf'));
const Email = lazy(() => import('$app/pages/invoices/email/Email'));
const EInvoice = lazy(
  () => import('$app/pages/invoices/edit/components/EInvoice')
);
const Documents = lazy(
  () => import('$app/pages/invoices/edit/components/Documents')
);
const Payments = lazy(
  () => import('$app/pages/invoices/edit/components/Payments')
);
const Settings = lazy(
  () => import('$app/pages/invoices/edit/components/Settings')
);
const Activities = lazy(
  () => import('$app/pages/invoices/edit/components/Activities')
);
const History = lazy(
  () => import('$app/pages/invoices/edit/components/History')
);
const EmailHistory = lazy(
  () => import('$app/pages/invoices/edit/components/EmailHistory')
);
const CreatePage = lazy(
  () => import('$app/pages/invoices/create/components/CreatePage')
);

export const invoiceRoutes = (
  <Route path="/invoices">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Invoices),
            or(
              permission('view_invoice'),
              permission('create_invoice'),
              permission('edit_invoice')
            ),
          ]}
          component={<Invoices />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Invoices),
            or(permission('create_invoice'), permission('edit_invoice')),
          ]}
          component={<Import />}
        />
      }
    />

    <Route
      path="create"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Invoices),
            permission('create_invoice'),
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
            enabled(ModuleBitmask.Invoices),
            or(
              permission('view_invoice'),
              permission('edit_invoice'),
              assigned('/api/v1/invoices/:id')
            ),
          ]}
          component={<Invoice />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="e_invoice" element={<EInvoice />} />
      <Route path="documents" element={<Documents />} />
      <Route path="settings" element={<Settings />} />
      <Route path="activity" element={<Activities />} />
      <Route path="history" element={<History />} />
      <Route path="email_history" element={<EmailHistory />} />
      <Route path="payments" element={<Payments />} />
    </Route>

    <Route
      path=":id/pdf"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Invoices),
            or(permission('edit_invoice'), assigned('/api/v1/invoices/:id')),
          ]}
          component={<Pdf />}
        />
      }
    />
    <Route
      path=":id/email"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Invoices),
            or(permission('edit_invoice'), assigned('/api/v1/invoices/:id')),
          ]}
          component={<Email />}
        />
      }
    />
  </Route>
);
