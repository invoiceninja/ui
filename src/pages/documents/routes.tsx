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
import { Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { DocuNinjaGuard } from '$app/common/guards/DocuNinjaGuard';
import { docuNinjaAdmin, docuNinjaPermission } from '$app/common/guards/guards/docuninja/permission';

const Documents = lazy(() => import('$app/pages/documents/index/Documents'));
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

const EditUser = lazy(
  () => import('$app/pages/documents/pages/users/edit/Edit')
);
const UserSelection = lazy(
  () => import('$app/pages/documents/pages/users/UserSelection')
);
const Sign = lazy(() => import('$app/pages/documents/sign/index/Sign'));


export const documentsRoutes = (
  <>
    <Route
      path="documents"
      element={<DocuNinjaGuard guards={[]} component={<Documents />} />}
    />

    <Route
      path="documents/create"
      element={
        <DocuNinjaGuard 
          guards={[docuNinjaPermission({ model: 'documents', action: 'create' })]} 
          component={<Create />} 
        />
      }
    />

    <Route
      path="documents/settings"
      element={<DocuNinjaGuard guards={[docuNinjaAdmin()]} component={<Settings />} />}
    >
      <Route index element={<Navigate to="email_templates" replace />} />
      <Route
        path="email_templates"
        element={<DocuNinjaGuard guards={[docuNinjaAdmin()]} type="subPage" component={<EmailSettings />} />}
      />
      <Route
        path="notifications"
        element={<Guard guards={[]} type="subPage" component={<Notifications />} />}
      />
    </Route>

    <Route
      path="documents/:id"
      element={<Guard guards={[]} component={<DocumentShow />} />}
    />

    <Route
      path="documents/:id/builder"
      element={<Guard guards={[]} component={<Builder />} />}
    />

    <Route
      path="documents/blueprints"
      element={<DocuNinjaGuard guards={[docuNinjaPermission({ model: 'blueprints', action: 'view' })]} component={<Blueprints />} />}
    />

    <Route
      path="documents/blueprints/create"
      element={<DocuNinjaGuard guards={[docuNinjaPermission({ model: 'blueprints', action: 'create' })]} component={<CreateBlueprint />} />}
    />

    <Route
      path="documents/blueprints/:id/template_editor"
      element={<DocuNinjaGuard guards={[docuNinjaPermission({ model: 'blueprints', action: 'create' })]} component={<BlueprintEditor />} />}
    />

    <Route
      path="documents/blueprints/:id/edit"
      element={<DocuNinjaGuard guards={[docuNinjaPermission({ model: 'blueprints', action: 'create' })]} component={<BlueprintBuilder />} />}
    />

    <Route 
      path="documents/users" 
      element={<DocuNinjaGuard guards={[docuNinjaAdmin()]} component={<Users />} />} 
    />

    <Route
      path="documents/users/:id/edit"
      element={<DocuNinjaGuard guards={[docuNinjaAdmin()]} component={<EditUser />} />}
    />

    <Route
      path="documents/users/selection"
      element={<DocuNinjaGuard guards={[]} component={<UserSelection />} />}
    />

    <Route
      path="documents/sign/:document/:invitation"
      element={<Guard guards={[]} component={<Sign />} />}
    />
  </>
);
