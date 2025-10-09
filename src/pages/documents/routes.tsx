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
import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy } from 'react';
import { DocuNinjaGuard } from '$app/common/guards/DocuNinjaGuard';
import { docuNinjaAdmin, docuNinjaPermission } from '$app/common/guards/guards/docuninja/permission';
import { DocuNinjaProvider } from '$app/common/components/DocuNinjaProvider';

const Documents = lazy(() => import('$app/pages/documents/index/Documents'));
const Document = lazy(() => import('$app/pages/documents/show/Document'));
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
  <Route path="documents/*" element={
    <DocuNinjaProvider>
      <Routes>
        <Route
          path=""
          element={<DocuNinjaGuard guards={[]} component={<Documents />} />}
        />

        <Route
          path=":id"
          element={<DocuNinjaGuard guards={[]} component={<Document />} />}
        />

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
          path="settings"
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
          path=":id/builder"
          element={<Guard guards={[]} component={<Builder />} />}
        />

        <Route
          path="blueprints"
          element={<DocuNinjaGuard guards={[docuNinjaPermission({ model: 'blueprints', action: 'view' })]} component={<Blueprints />} />}
        />

        <Route
          path="blueprints/create"
          element={<DocuNinjaGuard guards={[docuNinjaPermission({ model: 'blueprints', action: 'create' })]} component={<CreateBlueprint />} />}
        />

        <Route
          path="blueprints/:id/template_editor"
          element={<DocuNinjaGuard guards={[docuNinjaPermission({ model: 'blueprints', action: 'create' })]} component={<BlueprintEditor />} />}
        />

        <Route
          path="blueprints/:id/edit"
          element={<DocuNinjaGuard guards={[docuNinjaPermission({ model: 'blueprints', action: 'create' })]} component={<BlueprintBuilder />} />}
        />

        <Route 
          path="users" 
          element={<DocuNinjaGuard guards={[docuNinjaAdmin()]} component={<Users />} />} 
        />

        <Route
          path="users/:id/edit"
          element={<DocuNinjaGuard guards={[docuNinjaAdmin()]} component={<EditUser />} />}
        />

        <Route
          path="users/selection"
          element={<DocuNinjaGuard guards={[]} component={<UserSelection />} />}
        />

        <Route
          path="sign/:document/:invitation"
          element={<Guard guards={[]} component={<Sign />} />}
        />
      </Routes>
    </DocuNinjaProvider>
  } />
);
