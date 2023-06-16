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
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { enabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';

const Transactions = lazy(
  () => import('$app/pages/transactions/index/Transactions')
);
const CreateTransaction = lazy(
  () => import('$app/pages/transactions/create/Create')
);
const Import = lazy(() => import('$app/pages/transactions/import/Import'));
const EditTransaction = lazy(() => import('$app/pages/transactions/edit/Edit'));

export const transactionRoutes = (
  <Route path="transactions">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Transactions),
            or(
              permission('view_bank_transaction'),
              permission('create_bank_transaction'),
              permission('edit_bank_transaction')
            ),
          ]}
          component={<Transactions />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Transactions),
            or(permission('create_bank_transaction')),
          ]}
          component={<CreateTransaction />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Transactions),
            or(
              permission('create_bank_transaction'),
              permission('edit_bank_transaction')
            ),
          ]}
          component={<Import />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Transactions),
            or(
              permission('view_bank_transaction'),
              permission('edit_bank_transaction'),
              assigned('/api/v1/bank_transactions/:id')
            ),
          ]}
          component={<EditTransaction />}
        />
      }
    />
  </Route>
);
