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
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { enabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { or } from '$app/common/guards/guards/or';
import { assigned } from '$app/common/guards/guards/assigned';
import { lazy } from 'react';

const Expenses = lazy(() => import('$app/pages/expenses/index/Expenses'));
const Import = lazy(() => import('$app/pages/expenses/import/Import'));
const Create = lazy(() => import('$app/pages/expenses/create/Create'));
const Expense = lazy(() => import('$app/pages/expenses/Expense'));
const Edit = lazy(() => import('$app/pages/expenses/edit/Edit'));
const Documents = lazy(() => import('$app/pages/expenses/documents/Documents'));

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
    <Route
      path=":id"
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
          component={<Expense />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="documents" element={<Documents />} />
    </Route>
  </Route>
);
