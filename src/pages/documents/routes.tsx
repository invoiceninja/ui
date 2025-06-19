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

export const documentsRoutes = (
  <Route path="documents">
    <Route path="" element={<Guard guards={[]} component={<Document />} />} />

    <Route
      path=":id"
      element={<Guard guards={[]} component={<DocumentShow />} />}
    />

    <Route
      path=":id/builder"
      element={<Guard guards={[]} component={<Builder />} />}
    />
  </Route>
);
