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
import { invoiceRoutes } from '$app/pages/invoices/routes';
import { clientRoutes } from '$app/pages/clients/routes';
import { productRoutes } from '$app/pages/products/routes';
import { recurringInvoiceRoutes } from '$app/pages/recurring-invoices/routes';
import { paymentRoutes } from '$app/pages/payments/routes';
import { settingsRoutes } from '$app/pages/settings/routes';
import { authenticationRoutes } from '$app/pages/authentication/routes';
import { quoteRoutes } from '$app/pages/quotes/routes';
import { creditRoutes } from '$app/pages/credits/routes';
import { projectRoutes } from '$app/pages/projects/routes';
import { taskRoutes } from '$app/pages/tasks/routes';
import { vendorRoutes } from '$app/pages/vendors/routes';
import { expenseRoutes } from '$app/pages/expenses/routes';
import { purchaseOrderRoutes } from '$app/pages/purchase-orders/routes';
import { reportRoutes } from '$app/pages/reports/routes';
import { transactionRoutes } from '$app/pages/transactions/routes';
import { recurringExpenseRoutes } from '$app/pages/recurring-expenses/routes';
import { lazy } from 'react';
import { Index } from '$app/pages/Index';
import { TestingRoute } from '$app/components/TestingRoute';
import { TestingPage } from '$app/components/TestingPage';
import { activityRoutes } from '$app/pages/activities/routes';

const Dashboard = lazy(() => import('$app/pages/dashboard/Dashboard'));
const NotFound = lazy(() => import('$app/components/NotFound'));

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
      {recurringExpenseRoutes}
      {reportRoutes}
      {transactionRoutes}
      {settingsRoutes}
      {activityRoutes}
      <Route element={<TestingRoute />}>
        <Route path="/testing" element={<TestingPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);
