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
import { permission } from 'common/guards/guards/permission';
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
          guards={[() => permission('view_project')]}
          component={<Projects />}
        />
      }
    />
    <Route
      path="/projects/create"
      element={
        <Guard
          guards={[() => permission('create_project')]}
          component={<Create />}
        />
      }
    />
    <Route
      path="/projects/:id"
      element={
        <Guard
          guards={[() => permission('edit_project')]}
          component={<Project />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="documents" element={<Documents />} />
    </Route>
  </Route>
);
