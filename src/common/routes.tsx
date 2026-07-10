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
import { Route, Routes } from 'react-router';
import { isCalendarConnectionAvailable } from '$app/common/helpers';
import { TestingPage } from '$app/components/TestingPage';
import { TestingRoute } from '$app/components/TestingRoute';
import { activityRoutes } from '$app/pages/activities/routes';
import { authenticationRoutes } from '$app/pages/authentication/routes';
import { clientRoutes } from '$app/pages/clients/routes';
import { creditRoutes } from '$app/pages/credits/routes';
import { documentsRoutes } from '$app/pages/documents/routes';
import { expenseRoutes } from '$app/pages/expenses/routes';
import { Index } from '$app/pages/Index';
import { invoiceRoutes } from '$app/pages/invoices/routes';
import { paymentRoutes } from '$app/pages/payments/routes';
import { productRoutes } from '$app/pages/products/routes';
import { projectRoutes } from '$app/pages/projects/routes';
import { purchaseOrderRoutes } from '$app/pages/purchase-orders/routes';
import { quoteRoutes } from '$app/pages/quotes/routes';
import { recurringExpenseRoutes } from '$app/pages/recurring-expenses/routes';
import { recurringInvoiceRoutes } from '$app/pages/recurring-invoices/routes';
import { reportRoutes } from '$app/pages/reports/routes';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { CorpPassFailed } from '$app/pages/settings/e-invoice/peppol/CorpPassFailed';
import { CorpPassSuccess } from '$app/pages/settings/e-invoice/peppol/CorpPassSuccess';
import { settingsRoutes } from '$app/pages/settings/routes';
import { taskRoutes } from '$app/pages/tasks/routes';
import { transactionRoutes } from '$app/pages/transactions/routes';
import { vendorRoutes } from '$app/pages/vendors/routes';
import { HostedRoute } from '../components/HostedRoute';
import { PrivateRoute } from '../components/PrivateRoute';
import { Guard } from './guards/Guard';
import { enabled } from './guards/guards/enabled';
import { or } from './guards/guards/or';
import { permission } from './guards/guards/permission';

const Dashboard = lazy(() => import('$app/pages/dashboard/Dashboard'));
const CalendarConnectionComplete = lazy(
  () => import('$app/pages/tasks/calendar/Complete')
);
const NotFound = lazy(() => import('$app/components/NotFound'));

export const routes = (
  <Routes>
    <Route path="/" element={<Index />} />
    {authenticationRoutes}
    <Route element={<PrivateRoute />}>
      <Route
        path="/dashboard"
        element={
          <Guard
            guards={[permission('view_dashboard')]}
            component={<Dashboard />}
          />
        }
      />
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
      {documentsRoutes}
      {settingsRoutes}
      {activityRoutes}
      <Route
        element={<HostedRoute enabled={isCalendarConnectionAvailable()} />}
      >
        <Route
          path="/calendar_connection/complete"
          element={
            <Guard
              guards={[
                enabled(ModuleBitmask.Tasks),
                or(permission('view_task'), permission('edit_task')),
              ]}
              component={<CalendarConnectionComplete />}
            />
          }
        />
      </Route>
      <Route
        path="/einvoice/registration/success"
        element={<CorpPassSuccess />}
      />
      <Route
        path="/einvoice/registration/failed"
        element={<CorpPassFailed />}
      />
      <Route element={<TestingRoute />}>
        <Route path="/testing" element={<TestingPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);
