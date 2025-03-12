/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from '$app/common/guards/Guard';
import { companySettings } from '$app/common/guards/guards/company-settings';
import { or } from '$app/common/guards/guards/or';
import { plan } from '$app/common/guards/guards/plan';
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const InvoiceDesign = lazy(() => import('./InvoiceDesign'));
const GeneralSettings = lazy(
  () => import('./pages/general-settings/components/GeneralSettings')
);
const CustomDesigns = lazy(
  () => import('./pages/custom-designs/index/CustomDesigns')
);
const Create = lazy(() => import('./pages/custom-designs/pages/create/Create'));
const ClientDetails = lazy(
  () => import('./pages/general-settings/components/ClientDetails')
);
const CompanyDetails = lazy(
  () => import('./pages/general-settings/components/CompanyDetails')
);
const CompanyAddress = lazy(
  () => import('./pages/general-settings/components/CompanyAddress')
);
const InvoiceDetails = lazy(
  () => import('./pages/general-settings/components/InvoiceDetails')
);
const QuoteDetails = lazy(
  () => import('./pages/general-settings/components/QuoteDetails')
);
const CreditDetails = lazy(
  () => import('./pages/general-settings/components/CreditDetails')
);
const VendorDetails = lazy(
  () => import('./pages/general-settings/components/VendorDetails')
);
const PurchaseOrderDetails = lazy(
  () => import('./pages/general-settings/components/PurchaseOrderDetails')
);
const ProductColumns = lazy(
  () => import('./pages/general-settings/components/ProductColumns')
);
const ProductQuoteColumns = lazy(
  () => import('./pages/general-settings/components/ProductQuoteColumns')
);
const TaskColumns = lazy(
  () => import('./pages/general-settings/components/TaskColumns')
);
const TotalFields = lazy(
  () => import('./pages/general-settings/components/TotalFields')
);
const CustomDesign = lazy(() => import('./pages/custom-designs/CustomDesign'));
const Settings = lazy(
  () => import('./pages/custom-designs/pages/edit/components/Settings')
);
const Body = lazy(
  () => import('./pages/custom-designs/pages/edit/components/Body')
);
const Headers = lazy(
  () => import('./pages/custom-designs/pages/edit/components/Headers')
);
const Footer = lazy(
  () => import('./pages/custom-designs/pages/edit/components/Footer')
);
const Includes = lazy(
  () => import('./pages/custom-designs/pages/edit/components/Includes')
);
const Variables = lazy(
  () => import('./pages/custom-designs/pages/edit/components/Variables')
);

export const invoiceDesignRoutes = (
  <Route path="invoice_design" element={<InvoiceDesign />}>
    <Route path="" element={<GeneralSettings />} />
    <Route path="custom_designs" element={<CustomDesigns />} />
    <Route
      path="custom_designs/:id/edit"
      element={
        <Guard
          guards={[companySettings()]}
          component={<CustomDesign />}
          type="subPage"
        />
      }
    >
      <Route path="" element={<Settings />} />
      <Route path="body" element={<Body />} />
      <Route path="header" element={<Headers />} />
      <Route path="footer" element={<Footer />} />
      <Route path="includes" element={<Includes />} />
      <Route path="variables" element={<Variables />} />
    </Route>
    <Route path="custom_designs/create" element={<Create />} />
    <Route
      path="client_details"
      element={
        <Guard
          guards={[companySettings()]}
          component={<ClientDetails />}
          type="subPage"
        />
      }
    />
    <Route
      path="company_details"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<CompanyDetails />}
          type="subPage"
        />
      }
    />
    <Route
      path="company_address"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<CompanyAddress />}
          type="subPage"
        />
      }
    />
    <Route
      path="invoice_details"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<InvoiceDetails />}
          type="subPage"
        />
      }
    />
    <Route
      path="quote_details"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<QuoteDetails />}
          type="subPage"
        />
      }
    />
    <Route
      path="credit_details"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<CreditDetails />}
          type="subPage"
        />
      }
    />
    <Route
      path="vendor_details"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<VendorDetails />}
          type="subPage"
        />
      }
    />
    <Route
      path="purchase_order_details"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<PurchaseOrderDetails />}
          type="subPage"
        />
      }
    />
    <Route
      path="product_columns"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<ProductColumns />}
          type="subPage"
        />
      }
    />
    <Route
      path="quote_product_columns"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<ProductQuoteColumns />}
          type="subPage"
        />
      }
    />
    <Route
      path="task_columns"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<TaskColumns />}
          type="subPage"
        />
      }
    />
    <Route
      path="total_fields"
      element={
        <Guard
          guards={[companySettings(), or(plan('enterprise'), plan('pro'))]}
          component={<TotalFields />}
          type="subPage"
        />
      }
    />
  </Route>
);
