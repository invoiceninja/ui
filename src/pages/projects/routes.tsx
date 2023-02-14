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
import { Documents } from './documents/Documents';
import { Edit } from './edit/Edit';
import { Projects } from './index/Projects';
import { Project } from './Project';

export const projectRoutes = (
  <Route>
    <Route
      path="/projects"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Projects),
            or(permission('view_project'), permission('create_project')),
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
            or(permission('edit_project'), assigned('/api/v1/projects/:id')),
          ]}
          component={<Project />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="documents" element={<Documents />} />
    </Route>
  </Route>
);
