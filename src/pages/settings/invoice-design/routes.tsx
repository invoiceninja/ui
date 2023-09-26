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
const TemplateDesigns = lazy(
  () => import('./pages/template-designs/TemplateDesigns')
);
const Edit = lazy(() => import('./pages/custom-designs/pages/edit/Edit'));
const Create = lazy(() => import('./pages/custom-designs/pages/create/Create'));

const CreateTemplate = lazy(() => import('./pages/template-designs/pages/create/Create'));
const EditTemplate = lazy(() => import('./pages/template-designs/pages/edit/Edit'));

export const invoiceDesignRoutes = (
  <Route path="invoice_design" element={<InvoiceDesign />}>
    <Route path="" element={<GeneralSettings />} />
    <Route path="custom_designs" element={<CustomDesigns />} />
    <Route path="custom_designs/:id/edit" element={<Edit />} />
    <Route path="custom_designs/create" element={<Create />} />
    <Route path="template_designs" element={<TemplateDesigns />} />
    <Route path="template_designs/:id/edit" element={<EditTemplate />} />
    <Route path="template_designs/create" element={<CreateTemplate />} />
  </Route>
);
