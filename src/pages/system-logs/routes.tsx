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
import { SystemLog } from './SystemLog';

export const systemlogRoutes = (
  <Route path="/system_logs">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('is_admin')]}
          component={<SystemLog />}
        />
      }
    />
  </Route>
);
