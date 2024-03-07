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
import Import from './import/Import';

const Tasks = lazy(() => import('$app/pages/tasks/index/Tasks'));
const Kanban = lazy(() => import('$app/pages/tasks/kanban/Kanban'));
const Create = lazy(() => import('$app/pages/tasks/create/Create'));
const Task = lazy(() => import('$app/pages/tasks/Task'));
const Edit = lazy(() => import('$app/pages/tasks/edit/Edit'));
const Documents = lazy(() => import('$app/pages/tasks/documents/Documents'));

export const taskRoutes = (
  <Route path="/tasks">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Tasks),
            or(
              permission('view_task'),
              permission('create_task'),
              permission('edit_task')
            ),
          ]}
          component={<Tasks />}
        />
      }
    />

    <Route
      path="kanban"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Tasks),
            or(permission('view_task'), permission('edit_task')),
          ]}
          component={<Kanban />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[enabled(ModuleBitmask.Tasks), permission('create_task')]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Tasks),
            or(
              permission('view_task'),
              permission('edit_task'),
              assigned('/api/v1/tasks/:id')
            ),
          ]}
          component={<Task />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="documents" element={<Documents />} />
    </Route>
    <Route
      path="import"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Tasks),
            or(permission('create_task'), permission('edit_task')),
          ]}
          component={<Import />}
        />
      }
    />
  </Route>
);
