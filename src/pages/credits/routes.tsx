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
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Credits = lazy(() => import('$app/pages/credits/index/Credits'));
const Create = lazy(() => import('$app/pages/credits/create/Create'));
const CreatePage = lazy(
  () => import('$app/pages/credits/create/components/CreatePage')
);
const Credit = lazy(() => import('$app/pages/credits/Credit'));
const Edit = lazy(() => import('$app/pages/credits/edit/Edit'));
const Pdf = lazy(() => import('$app/pages/credits/pdf/Pdf'));
const Email = lazy(() => import('$app/pages/credits/email/Email'));
const Documents = lazy(
  () => import('$app/pages/credits/edit/components/Documents')
);
const Settings = lazy(
  () => import('$app/pages/credits/edit/components/Settings')
);
const Activities = lazy(
  () => import('$app/pages/credits/edit/components/Activities')
);
const History = lazy(
  () => import('$app/pages/credits/edit/components/History')
);

export const creditRoutes = (
  <Route path="/credits">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Credits),
            or(
              permission('view_credit'),
              permission('create_credit'),
              permission('edit_credit')
            ),
          ]}
          component={<Credits />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[enabled(ModuleBitmask.Credits), permission('create_credit')]}
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
            enabled(ModuleBitmask.Credits),
            or(
              permission('edit_credit'),
              permission('view_credit'),
              assigned('/api/v1/credits/:id')
            ),
          ]}
          component={<Credit />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="documents" element={<Documents />} />
      <Route path="settings" element={<Settings />} />
      <Route path="activity" element={<Activities />} />
      <Route path="history" element={<History />} />
    </Route>

    <Route
      path=":id/pdf"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Credits),
            or(permission('edit_credit'), assigned('/api/v1/credits/:id')),
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
            enabled(ModuleBitmask.Credits),
            or(permission('edit_credit'), assigned('/api/v1/credits/:id')),
          ]}
          component={<Email />}
        />
      }
    />
  </Route>
);
