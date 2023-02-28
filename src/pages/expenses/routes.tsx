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
import { Expenses } from './index/Expenses';
import { Import } from 'pages/expenses/import/Import';
import { enabled } from 'common/guards/guards/enabled';
import { ModuleBitmask } from 'pages/settings/account-management/component';
import { or } from 'common/guards/guards/or';
import { assigned } from 'common/guards/guards/assigned';

export const expenseRoutes = (
  <Route path="expenses">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Expenses),
            or(
              permission('view_expense'),
              permission('create_expense'),
              permission('edit_expense')
            ),
          ]}
          component={<Expenses />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Expenses),
            or(permission('create_expense'), permission('edit_expense')),
          ]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Expenses),
            permission('create_expense'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route path=":id">
      <Route
        path="edit"
        element={
          <Guard
            guards={[
              enabled(ModuleBitmask.Expenses),
              or(
                permission('view_expense'),
                permission('edit_expense'),
                assigned('/api/v1/expenses/:id')
              ),
            ]}
            component={<Edit />}
          />
        }
      />
      <Route
        path="documents"
        element={
          <Guard
            guards={[
              enabled(ModuleBitmask.Expenses),
              or(
                permission('view_expense'),
                permission('edit_expense'),
                assigned('/api/v1/expenses/:id')
              ),
            ]}
            component={<Documents />}
          />
        }
      />
    </Route>
  </Route>
);
