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
const GeneralSettings = lazy(
  () => import('./pages/general-settings/GeneralSettings')
);
const CustomDesigns = lazy(
  () => import('./pages/custom-designs/CustomDesigns')
);
const Edit = lazy(() => import('./pages/custom-designs/pages/edit/Edit'));
const Create = lazy(() => import('./pages/custom-designs/pages/create/Create'));

export const invoiceDesignRoutes = (
  <Route path="invoice_design" element={<InvoiceDesign />}>
    <Route path="" element={<GeneralSettings />} />
    <Route path="custom_designs" element={<CustomDesigns />} />
    <Route path="custom_designs/:id/edit" element={<Edit />} />
    <Route path="custom_designs/create" element={<Create />} />
  </Route>
);
