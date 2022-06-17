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
import { Credits } from './index/Credits';

export const creditRoutes = (
  <Route>
    <Route
      path="/credits"
      element={
        <Guard
          guards={[() => permission('view_credit')]}
          component={<Credits />}
        />
      }
    />
  </Route>
);
