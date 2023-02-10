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
  Transactions,
  Import,
} from './index';

export const transactionRoutes = (
  <Route path="transactions">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_bank_transaction')]}
          component={<Transactions />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_bank_transaction')]}
          component={<CreateTransaction />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            () =>
              permission('create_bank_transaction') ||
              permission('edit_bank_transaction'),
          ]}
          component={<Import />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[() => permission('edit_bank_transaction')]}
          component={<EditTransaction />}
        />
      }
    />
  </Route>
);
