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
import { PurchaseOrders } from './index/PurchaseOrders';

export const purchaseOrdersRoutes = (
  <Route path="/purchase_orders">
    <Route path="" element={<PurchaseOrders />} />
  </Route>
);
