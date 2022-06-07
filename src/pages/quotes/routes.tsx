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
import { Edit } from './edit/Edit';
import { Quotes } from './index/Quotes';

export const quoteRoutes = (
  <Route path="/quotes">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_quote')]}
          component={<Quotes />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard guards={[() => permission('edit_quote')]} component={<Edit />} />
      }
    />
  </Route>
);
