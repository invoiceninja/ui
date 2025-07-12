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
import { Route } from 'react-router-dom';
import { lazy } from 'react';

const Document = lazy(() => import('$app/pages/documents/Document'));
const DocumentShow = lazy(() => import('$app/pages/documents/show/Document'));
const Create = lazy(() => import('$app/pages/documents/create/Create'));
const Blueprints = lazy(
  () => import('$app/pages/documents/pages/blueprints/Blueprints')
);
const CreateBlueprint = lazy(
  () => import('$app/pages/documents/pages/blueprints/create/Create')
);
const EditBlueprint = lazy(
  () => import('$app/pages/documents/pages/blueprints/edit/Edit')
);
const Settings = lazy(
  () => import('$app/pages/documents/pages/settings/Settings')
);
const Builder = lazy(() => import('$app/pages/documents/builder/Builder'));
const EmailSettings = lazy(
  () =>
    import(
      '$app/pages/documents/pages/settings/pages/email-settings/EmailSettings'
    )
);
const Users = lazy(
  () => import('$app/pages/documents/pages/settings/pages/users/Users')
);

export const documentsRoutes = (
  <Route path="documents">
    <Route
      path="create"
      element={<Guard guards={[]} component={<Create />} />}
    />

    <Route path="" element={<Guard guards={[]} component={<Document />} />} />

    <Route
      path="settings"
      element={<Guard guards={[]} component={<Settings />} />}
    >
      <Route
        path=""
        element={
          <Guard guards={[]} type="subPage" component={<EmailSettings />} />
        }
      />

      <Route
        path="users"
        element={<Guard guards={[]} type="subPage" component={<Users />} />}
      />
    </Route>

    <Route
      path=":id"
      element={<Guard guards={[]} component={<DocumentShow />} />}
    />

    <Route
      path=":id/builder"
      element={<Guard guards={[]} component={<Builder />} />}
    />

    <Route
      path="blueprints"
      element={<Guard guards={[]} component={<Blueprints />} />}
    />

    <Route
      path="blueprints/create"
      element={<Guard guards={[]} component={<CreateBlueprint />} />}
    />

    <Route
      path="blueprints/:id/edit"
      element={<Guard guards={[]} component={<EditBlueprint />} />}
    />
  </Route>
);
