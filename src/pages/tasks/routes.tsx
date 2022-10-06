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
import { enabled } from 'common/guards/guards/enabled';
import { permission } from 'common/guards/guards/permission';
import { ModuleBitmask } from 'pages/settings/account-management/component';
import { Route } from 'react-router-dom';
import { Clone } from './clone/Clone';
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
            () => enabled(ModuleBitmask.Tasks),
            () => permission('view_task'),
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
            () => enabled(ModuleBitmask.Tasks),
            () => permission('view_task'),
          ]}
          component={<Kanban />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.Tasks),
            () => permission('create_task'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.Tasks),
            () => permission('edit_task'),
          ]}
          component={<Edit />}
        />
      }
    />
    <Route
      path=":id/clone"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.Tasks),
            () => permission('create_task'),
          ]}
          component={<Clone />}
        />
      }
    />
  </Route>
);
