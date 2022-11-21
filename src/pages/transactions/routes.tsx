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
import {
  CreateTransaction,
  EditTransaction,
  Transaction,
  Transactions,
} from './index';

export const transactionRoutes = (
  <Route path="transactions">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_transaction')]}
          component={<Transactions />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_transaction')]}
          component={<CreateTransaction />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[() => permission('view_transaction')]}
          component={<Transaction />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[() => permission('edit_transaction')]}
          component={<EditTransaction />}
        />
      }
    />
  </Route>
);
