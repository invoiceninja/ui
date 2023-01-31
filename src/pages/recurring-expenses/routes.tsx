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
import { Create } from './create/Create';
import { Documents } from './documents/Documents';
import { Edit } from './edit/Edit';
import { RecurringExpenses } from './index/RecurringExpenses';

export const recurringExpenseRoutes = (
  <Route path="/recurring_expenses">
    <Route
      path=""
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.RecurringExpenses),
            () =>
              permission('view_recurring_expense') ||
              permission('edit_recurring_expense') ||
              permission('edit_recurring_expense'),
          ]}
          component={<RecurringExpenses />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.RecurringExpenses),
            () => permission('create_recurring_expense'),
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
              () => enabled(ModuleBitmask.RecurringExpenses),
              () => permission('view_recurring_expense') || permission('edit_recurring_expense'),
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
              () => enabled(ModuleBitmask.RecurringExpenses),
              () => permission('view_recurring_expense'),
            ]}
            component={<Documents />}
          />
        }
      />
    </Route>
  </Route>
);
