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
import { Expenses } from './index/Expenses';

export const expenseRoutes = (
  <Route>
    <Route
      path="expenses"
      element={
        <Guard
          guards={[() => permission('view_expense')]}
          component={<Expenses />}
        />
      }
    />
  </Route>
);
