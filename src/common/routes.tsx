/* eslint-disable */

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
import { HostedRoute } from '../components/HostedRoute';
import { PrivateRoute } from '../components/PrivateRoute';
import { PublicRoute } from '../components/PublicRoute';
import { Index } from '../pages/Index';
import { Dashboard } from '../pages/dashboard/Dashboard';

import * as Authentication from '../pages/authentication';
import * as Products from '../pages/products';
import * as Invoices from '../pages/invoices';
import * as Settings from '../pages/settings';
import * as Clients from '../pages/clients';
import * as Payments from '../pages/payments';
import * as RecurringInvoices from '../pages/recurring-invoices';
import * as Credits from '../pages/credits';
import * as Projects from '../pages/projects';
import * as Vendors from '../pages/vendors';
import * as Expenses from '../pages/expenses';
import * as RecurringExpenses from '../pages/recurring-expenses';
import { Unauthorized } from 'pages/errors/401';
import { Guard } from './guards/Guard';
import { permission } from './guards/guards/permission';
import { invoiceRoutes } from 'pages/invoices/routes';
import { clientRoutes } from 'pages/clients/routes';
import { productRoutes } from 'pages/products/routes';
import { recurringInvoiceRoutes } from 'pages/recurring-invoices/routes';
import { paymentRoutes } from 'pages/payments/routes';
import { settingsRoutes } from 'pages/settings/routes';

export const routes = (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<Authentication.Login />} />
      <Route
        path="/recover_password"
        element={<Authentication.RecoverPassword />}
      />
      <Route element={<HostedRoute />}>
        <Route path="/register" element={<Authentication.Register />} />
      </Route>
    </Route>
    <Route element={<PrivateRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      {invoiceRoutes}
      {clientRoutes}
      {productRoutes}
      {recurringInvoiceRoutes}
      {paymentRoutes}
      {settingsRoutes}
      <Route path="/logout" element={<Authentication.Logout />} />
    </Route>
  </Routes>
);
