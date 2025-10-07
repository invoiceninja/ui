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
import { DocuNinjaGuard } from '$app/common/guards/DocuNinjaGuard';
import { docuNinjaHasCreateOrViewPermission, docuNinjaPermission } from '$app/common/guards/guards/docuninja/permission';

const Document = lazy(() => import('$app/pages/documents/Document'));
const DocumentShow = lazy(() => import('$app/pages/documents/show/Document'));
const Create = lazy(() => import('$app/pages/documents/create/Create'));
const Blueprints = lazy(
  () => import('$app/pages/documents/pages/blueprints/Blueprints')
);
const CreateBlueprint = lazy(
  () => import('$app/pages/documents/pages/blueprints/create/Create')
);
const BlueprintEditor = lazy(
  () => import('$app/pages/documents/pages/blueprints/editor/Editor')
);

const Settings = lazy(
  () => import('$app/pages/documents/pages/settings/CompanyDetails')
);

const Notifications = lazy(
  () => import('$app/pages/documents/pages/settings/pages/notifications/Notifications')
);

const Builder = lazy(() => import('$app/pages/documents/builder/Builder'));
const BlueprintBuilder = lazy(
  () => import('$app/pages/documents/pages/blueprints/builder/BlueprintBuilder')
);
const EmailSettings = lazy(
  () =>
    import(
      '$app/pages/documents/pages/settings/pages/email-settings/EmailSettings'
    )
);

const Users = lazy(() => import('$app/pages/documents/pages/users/Users'));
const CreateUser = lazy(
  () => import('$app/pages/documents/pages/users/create/Create')
);
const EditUser = lazy(
  () => import('$app/pages/documents/pages/users/edit/Edit')
);
const UserSelection = lazy(
  () => import('$app/pages/documents/pages/users/UserSelection')
);
const Documents = lazy(() => import('$app/pages/documents/index/Documents'));
const Sign = lazy(() => import('$app/pages/documents/sign/index/Sign'));


export const documentsRoutes = (
  <Route
    path="documents"
    element={<DocuNinjaGuard guards={[]} component={<Document />} />}
  >
    <Route
      path="create"
      element={
        <DocuNinjaGuard 
          guards={[docuNinjaPermission({ model: 'documents', action: 'create' })]} 
          component={<Create />} 
        />
      }
    />

    <Route 
      path=""
      element={<Guard guards={[]} component={<Documents />} />}
 
      // element={
        // <DocuNinjaGuard 
        //   guards={[docuNinjaPermission({ model: 'documents', action: 'view' })]} 
        //   component={<Documents />} 
        // />
      // } 
    />

    <Route
      path="settings"
      element={<Guard guards={[]} component={<Settings />} />}
    >

      <Route
        path="email_templates"
        element={
          <Guard guards={[]} type="subPage" component={<EmailSettings />} />
        }
      />

      <Route
        path="notifications"
        element={<Guard guards={[]} type="subPage" component={<Notifications />} />}
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
      path="blueprints/:id/template_editor"
      element={<Guard guards={[]} component={<BlueprintEditor />} />}
    />

    <Route
      path="blueprints/:id/edit"
      element={<Guard guards={[]} component={<BlueprintBuilder />} />}
    />

    <Route path="users" element={<DocuNinjaGuard guards={[]} component={<Users />} />} />

    <Route
      path="users/create"
      element={<Guard guards={[]} component={<CreateUser />} />}
    />

    <Route
      path="users/:id/edit"
      element={<Guard guards={[]} component={<EditUser />} />}
    />

    <Route
      path="users/selection"
      element={<DocuNinjaGuard guards={[]} component={<UserSelection />} />}
    />

    <Route
      path="sign/:document/:invitation"
      element={<Guard guards={[]} component={<Sign />} />}
    />
  </Route>
);
