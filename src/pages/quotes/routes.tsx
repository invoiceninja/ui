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
import { Edit } from './edit/Edit';
import { Email } from './email/Email';
import { Quotes } from './index/Quotes';
import { Pdf } from './pdf/Pdf';
import { Import } from 'pages/quotes/import/Import';
import { enabled } from 'common/guards/guards/enabled';
import { ModuleBitmask } from 'pages/settings/account-management/component';

export const quoteRoutes = (
  <Route path="/quotes">
    <Route
      path=""
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.Quotes),
            () =>
              permission('view_quote') ||
              permission('view_quote') ||
              permission('create_quote'),
          ]}
          component={<Quotes />}
        />
      }
    />
    <Route
      path="import"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.Quotes),
            () => permission('create_quote') || permission('edit_quote'),
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
            () => enabled(ModuleBitmask.Quotes),
            () => permission('view_quote') || permission('edit_quote'),
          ]}
          component={<Edit />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.Quotes),
            () => permission('create_quote'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id/pdf"
      element={
        <Guard
          guards={[
            () => enabled(ModuleBitmask.Quotes),
            () => permission('view_quote'),
          ]}
          component={<Pdf />}
        />
      }
    />
    <Route
      path=":id/email"
      element={
        <Guard
          guards={[() => permission('view_quote')]}
          component={<Email />}
        />
      }
    />
  </Route>
);
