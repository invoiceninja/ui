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
import { lazy } from 'react';

const Reports = lazy(() => import('$app/pages/reports/index/Reports'));

export const reportRoutes = (
  <Route>
    <Route path="/reports" element={<Reports />} />
  </Route>
);
