/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Route, Routes } from 'react-router';
import { PrivateRoute } from '../components/PrivateRoute';
import { Index } from '../pages/Index';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { invoiceRoutes } from 'pages/invoices/routes';
import { clientRoutes } from 'pages/clients/routes';
import { productRoutes } from 'pages/products/routes';
import { recurringInvoiceRoutes } from 'pages/recurring-invoices/routes';
import { paymentRoutes } from 'pages/payments/routes';
import { settingsRoutes } from 'pages/settings/routes';
import { authenticationRoutes } from 'pages/authentication/routes';
import { quoteRoutes } from 'pages/quotes/routes';
import { creditRoutes } from 'pages/credits/routes';
import { systemlogRoutes } from 'pages/system-logs/routes';
import { projectRoutes } from 'pages/projects/routes';
import { taskRoutes } from 'pages/tasks/routes';
import { vendorRoutes } from 'pages/vendors/routes';
import { expenseRoutes } from 'pages/expenses/routes';
import { purchaseOrderRoutes } from 'pages/purchase-orders/routes';
import { reportRoutes } from 'pages/reports/routes';
import { transactionRoutes } from 'pages/transactions/routes';

export const routes = (
  <Routes>
    <Route path="/" element={<Index />} />
    {authenticationRoutes}
    <Route element={<PrivateRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      {invoiceRoutes}
      {clientRoutes}
      {productRoutes}
      {recurringInvoiceRoutes}
      {paymentRoutes}
      {quoteRoutes}
      {creditRoutes}
      {projectRoutes}
      {taskRoutes}
      {vendorRoutes}
      {purchaseOrderRoutes}
      {expenseRoutes}
      {reportRoutes}
      {transactionRoutes}
      {settingsRoutes}
      {systemlogRoutes}
    </Route>
  </Routes>
);
