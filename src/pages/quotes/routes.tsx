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
import { Outlet, Route } from 'react-router-dom';
import { enabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { or } from '$app/common/guards/guards/or';
import { assigned } from '$app/common/guards/guards/assigned';
import { lazy } from 'react';

const Quotes = lazy(() => import('$app/pages/quotes/index/Quotes'));
const Import = lazy(() => import('$app/pages/quotes/import/Import'));
const Quote = lazy(() => import('$app/pages/quotes/Quote'));
const Edit = lazy(() => import('$app/pages/quotes/edit/Edit'));
const Create = lazy(() => import('$app/pages/quotes/create/Create'));
const CreatePage = lazy(
  () => import('$app/pages/quotes/create/components/CreatePage')
);
const Documents = lazy(
  () => import('$app/pages/quotes/edit/components/Documents')
);
const Settings = lazy(
  () => import('$app/pages/quotes/edit/components/Settings')
);
const Pdf = lazy(() => import('$app/pages/quotes/pdf/Pdf'));
const Email = lazy(() => import('$app/pages/quotes/email/Email'));
const Activities = lazy(
  () => import('$app/pages/quotes/edit/components/Activities')
);
const History = lazy(() => import('$app/pages/quotes/edit/components/History'));
const EmailHistory = lazy(
  () => import('$app/pages/quotes/edit/components/EmailHistory')
);

export const quoteRoutes = (
  <Route path="/quotes">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Quotes),
            or(
              permission('view_quote'),
              permission('create_quote'),
              permission('edit_quote')
            ),
          ]}
          component={<Quotes />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Quotes),
            or(permission('create_quote'), permission('edit_quote')),
          ]}
          component={<Import />}
        />
      }
    />

    <Route
      path=":id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Quotes),
            or(
              permission('view_quote'),
              permission('edit_quote'),
              assigned('/api/v1/quotes/:id')
            ),
          ]}
          component={<Quote />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="documents" element={<Documents />} />
      <Route path="settings" element={<Settings />} />
      <Route path="activity" element={<Activities />} />
      <Route path="history" element={<History />} />
      <Route path="email_history" element={<EmailHistory />} />
    </Route>

    <Route
      path="create"
      element={
        <Guard
          guards={[enabled(ModuleBitmask.Quotes), permission('create_quote')]}
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
            enabled(ModuleBitmask.Quotes),
            or(permission('edit_quote'), assigned('/api/v1/quotes/:id')),
          ]}
          component={<Outlet />}
        />
      }
    >
      <Route path="pdf" element={<Pdf />} />
      <Route path="email" element={<Email />} />
    </Route>
  </Route>
);
