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
import { Clone } from './clone/Clone';
import { Create } from './create/Create';
import { Documents } from './documents/Documents';
import { Edit } from './edit/Edit';
import { Expenses } from './index/Expenses';
import { Import } from 'pages/expenses/import/Import';

export const expenseRoutes = (
  <Route path="expenses">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_expense')]}
          component={<Expenses />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            () => permission('create_expense') || permission('edit_expense'),
          ]}
          component={<Import />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_expense')]}
          component={<Create />}
        />
      }
    />
    <Route path=":id">
      <Route
        path="edit"
        element={
          <Guard
            guards={[() => permission('edit_expense')]}
            component={<Edit />}
          />
        }
      />
      <Route
        path="documents"
        element={
          <Guard
            guards={[() => permission('view_expense')]}
            component={<Documents />}
          />
        }
      />
      <Route
        path="clone"
        element={
          <Guard
            guards={[() => permission('view_expense')]}
            component={<Clone />}
          />
        }
      />
    </Route>
  </Route>
);
