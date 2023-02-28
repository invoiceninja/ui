/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from 'common/guards/Guard';
import { assigned } from 'common/guards/guards/assigned';
import { enabled } from 'common/guards/guards/enabled';
import { or } from 'common/guards/guards/or';
import { permission } from 'common/guards/guards/permission';
import { ModuleBitmask } from 'pages/settings/account-management/component';
import { Route } from 'react-router-dom';
import { Create } from './create/Create';
import { Edit } from './edit/Edit';
import { Tasks } from './index/Tasks';
import { Kanban } from './kanban/Kanban';

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
      path=":id/edit"
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
          component={<Edit />}
        />
      }
    />
  </Route>
);
