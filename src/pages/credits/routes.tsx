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
import { Credits } from './index/Credits';
import { Pdf } from './pdf/Pdf';

export const creditRoutes = (
  <Route path="/credits">
    <Route
      path=""
      element={
        <Guard
          guards={[() => permission('view_credit')]}
          component={<Credits />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[() => permission('edit_credit')]}
          component={<Edit />}
        />
      }
    />
    <Route
      path=":id/pdf"
      element={
        <Guard guards={[() => permission('view_credit')]} component={<Pdf />} />
      }
    />
  </Route>
);
