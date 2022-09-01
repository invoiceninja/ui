/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Route } from 'react-router-dom';
import { Create } from './create/Create';
import { Edit } from './edit/Edit';
import { PurchaseOrders } from './index/PurchaseOrders';

export const purchaseOrdersRoutes = (
  <Route path="/purchase_orders">
    <Route path="" element={<PurchaseOrders />} />
    <Route path=":id/edit" element={<Edit />} />
    <Route path="create" element={<Create />} />
  </Route>
);
