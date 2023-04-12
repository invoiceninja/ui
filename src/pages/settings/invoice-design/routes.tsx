/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { lazy } from 'react';
import { Route } from 'react-router-dom';

const InvoiceDesign = lazy(() => import('./InvoiceDesign'));
const GeneralSettings = lazy(() => import('./pages/GeneralSettings'));
const CustomDesigns = lazy(() => import('./pages/CustomDesigns'));

export const invoiceDesignRoutes = (
  <Route path="invoice_design" element={<InvoiceDesign />}>
    <Route path="" element={<GeneralSettings />} />
    <Route path="custom_designs" element={<CustomDesigns />} />
  </Route>
);
