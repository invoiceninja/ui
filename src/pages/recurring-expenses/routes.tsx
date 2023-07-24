/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from '$app/common/guards/Guard';
import { assigned } from '$app/common/guards/guards/assigned';
import { enabled } from '$app/common/guards/guards/enabled';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { Route } from 'react-router-dom';
import { lazy } from 'react';

const RecurringExpense = lazy(
  () => import('$app/pages/recurring-expenses/RecurringExpense')
);
const RecurringExpenses = lazy(
  () => import('$app/pages/recurring-expenses/index/RecurringExpenses')
);
const Create = lazy(
  () => import('$app/pages/recurring-expenses/create/Create')
);
const Edit = lazy(() => import('$app/pages/recurring-expenses/edit/Edit'));
const Documents = lazy(
  () => import('$app/pages/recurring-expenses/documents/Documents')
);

export const recurringExpenseRoutes = (
  <Route path="/recurring_expenses">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.RecurringExpenses),
            or(
              permission('view_recurring_expense'),
              permission('create_recurring_expense'),
              permission('edit_recurring_expense')
            ),
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
            enabled(ModuleBitmask.RecurringExpenses),
            permission('create_recurring_expense'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.RecurringExpenses),
            or(
              permission('view_recurring_expense'),
              permission('edit_recurring_expense'),
              assigned('/api/v1/recurring_expenses/:id')
            ),
          ]}
          component={<RecurringExpense />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="documents" element={<Documents />} />
    </Route>
  </Route>
);
