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
import { Builder } from './builder/Builder';

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
const Clients = lazy(
  () => import('$app/pages/documents/pages/clients/Clients')
);
const CreateClient = lazy(
  () => import('$app/pages/documents/pages/clients/create/Create')
);
const EditClient = lazy(
  () => import('$app/pages/documents/pages/clients/edit/Edit')
);

export const documentsRoutes = (
  <Route path="documents">
    <Route
      path="create"
      element={<Guard guards={[]} component={<Create />} />}
    />

    <Route path="" element={<Guard guards={[]} component={<Document />} />} />

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

    <Route
      path="clients"
      element={<Guard guards={[]} component={<Clients />} />}
    />

    <Route
      path="clients/create"
      element={<Guard guards={[]} component={<CreateClient />} />}
    />

    <Route
      path="clients/:id/edit"
      element={<Guard guards={[]} component={<EditClient />} />}
    />
  </Route>
);
