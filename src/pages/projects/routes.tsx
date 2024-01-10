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
import { Route } from 'react-router-dom';
import { lazy } from 'react';

const Projects = lazy(() => import('$app/pages/projects/index/Projects'));
const Create = lazy(() => import('$app/pages/projects/create/Create'));
const Project = lazy(() => import('$app/pages/projects/Project'));
const Edit = lazy(() => import('$app/pages/projects/edit/Edit'));
const Show = lazy(() => import('$app/pages/projects/show/Show'));
const Documents = lazy(() => import('$app/pages/projects/documents/Documents'));

export const projectRoutes = (
  <Route>
    <Route
      path="/projects"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Projects),
            or(
              permission('view_project'),
              permission('create_project'),
              permission('edit_project')
            ),
          ]}
          component={<Projects />}
        />
      }
    />
    <Route
      path="/projects/create"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Projects),
            permission('create_project'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route
      path="/projects/:id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Projects),
            or(
              permission('view_project'),
              permission('edit_project'),
              assigned('/api/v1/projects/:id')
            ),
          ]}
          component={<Show />}
        />
      }
    />
    <Route
      path="/projects/:id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Projects),
            or(
              permission('view_project'),
              permission('edit_project'),
              assigned('/api/v1/projects/:id')
            ),
          ]}
          component={<Project />}
        />
      }
    >
      <Route path="documents" element={<Documents />} />
    </Route>

    <Route
      path="/projects/:id/edit"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Projects),
            or(permission('edit_project'), assigned('/api/v1/projects/:id')),
          ]}
          component={<Project />}
        />
      }
    >
      <Route path="" element={<Edit />} />
    </Route>
  </Route>
);
