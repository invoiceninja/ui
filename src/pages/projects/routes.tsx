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
import { Projects } from './index/Projects';

export const projectRoutes = (
  <Route>
    <Route
      path="/projects"
      element={
        <Guard
          guards={[() => permission('view_product')]}
          component={<Projects />}
        />
      }
    />
    <Route
      path="/projects/create"
      element={
        <Guard
          guards={[() => permission('create_product')]}
          component={<Create />}
        />
      }
    />
  </Route>
);
