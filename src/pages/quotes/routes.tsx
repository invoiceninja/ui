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
const Edit = lazy(() => import('$app/pages/quotes/edit/Edit'));
const Create = lazy(() => import('$app/pages/quotes/create/Create'));
const Pdf = lazy(() => import('$app/pages/quotes/pdf/Pdf'));
const Email = lazy(() => import('$app/pages/quotes/email/Email'));

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
      path=":id/edit"
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
          component={<Edit />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[enabled(ModuleBitmask.Quotes), permission('create_quote')]}
          component={<Create />}
        />
      }
    />
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
