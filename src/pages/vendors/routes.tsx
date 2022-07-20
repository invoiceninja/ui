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
import { Vendors } from './index/Vendors';

export const vendorRoutes = (
  <Route>
    <Route
      path="vendors"
      element={
        <Guard
          guards={[() => permission('view_vendor')]}
          component={<Vendors />}
        />
      }
    />
  </Route>
);
