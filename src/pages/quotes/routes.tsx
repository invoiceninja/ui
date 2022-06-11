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
import { CloneToInvoice } from './clone/CloneToInvoice';
import { Create } from './create/Create';
import { Edit } from './edit/Edit';
import { Email } from './email/Email';
import { Quotes } from './index/Quotes';
import { Pdf } from './pdf/Pdf';

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
    <Route
      path="create"
      element={
        <Guard
          guards={[() => permission('create_quote')]}
          component={<Create />}
        />
      }
    />
    <Route path=":id/clone" element={<Clone />} />
    <Route path=":id/clone/invoice" element={<CloneToInvoice />} />
    <Route
      path=":id/pdf"
      element={
        <Guard guards={[() => permission('view_quote')]} component={<Pdf />} />
      }
    />
    <Route path=":id/email" element={<Email />} />
  </Route>
);
