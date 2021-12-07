/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Route, Routes } from 'react-router';
import { HostedRoute } from '../components/HostedRoute';
import { PrivateRoute } from '../components/PrivateRoute';
import { PublicRoute } from '../components/PublicRoute';
import { Index } from '../pages/Index';
import { Dashboard } from '../pages/dashboard/Dashboard';
import {
  Login,
  Logout,
  RecoverPassword,
  Register,
} from '../pages/authentication';
import {
  ProductClone,
  ProductCreate,
  ProductEdit,
  Products,
} from '../pages/products';
import { Invoices, InvoiceCreate } from '../pages/invoices/index';
import {
  AccountManagement,
  CompanyDetails,
  ExpenseSettings,
  ImportExport,
  InvoiceDesign,
  Localization,
  OnlinePayments,
  ProductSettings,
  TaskSettings,
  TaxSettings,
  UserDetails,
  WorkflowSettings,
  Customize as CustomizeInvoiceDesign,
  CustomFields,
  GeneratedNumbers,
  CompanyCustomFields,
  ClientsCustomFields,
  ProductsCustomFields,
  InvoicesCustomFields,
  PaymentsCustomFields,
  ProjectsCustomFields,
  TasksCustomFields,
  VendorsCustomFields,
  ExpensesCustomFields,
  UsersCustomFields,
  ClientsGeneratedNumbers,
  InvoicesGeneratedNumbers,
  RecurringInvoicesGeneratedNumbers,
  PaymentsGeneratedNumbers,
  QuotesGeneratedNumbers,
  CreditsGeneratedNumbers,
  ProjectsGeneratedNumbers,
} from '../pages/settings';

export const routes = (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/recover_password" element={<RecoverPassword />} />
      <Route element={<HostedRoute />}>
        <Route path="/register" element={<Register />} />
      </Route>
    </Route>
    <Route element={<PrivateRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products">
        <Route path="" element={<Products />} />
        <Route path="create" element={<ProductCreate />} />
        <Route path=":id/edit" element={<ProductEdit />} />
        <Route path=":id/clone" element={<ProductClone />} />
      </Route>
      <Route path="/invoices">
        <Route path="" element={<Invoices />} />
        <Route path="create" element={<InvoiceCreate />} />
      </Route>
      <Route path="/settings">
        <Route path="company_details" element={<CompanyDetails />} />
        <Route path="user_details" element={<UserDetails />} />
        <Route path="localization" element={<Localization />} />
        <Route path="online_payments" element={<OnlinePayments />} />
        <Route path="tax_settings" element={<TaxSettings />} />
        <Route path="product_settings" element={<ProductSettings />} />
        <Route path="task_settings" element={<TaskSettings />} />
        <Route path="expense_settings" element={<ExpenseSettings />} />
        <Route path="workflow_settings" element={<WorkflowSettings />} />
        <Route path="import_export" element={<ImportExport />} />
        <Route path="account_management" element={<AccountManagement />} />
        <Route path="invoice_design" element={<InvoiceDesign />} />
        <Route
          path="invoice_design/customize"
          element={<CustomizeInvoiceDesign />}
        />
        <Route path="custom_fields">
          <Route path="" element={<CustomFields />} />
          <Route path="company" element={<CompanyCustomFields />} />
          <Route path="clients" element={<ClientsCustomFields />} />
          <Route path="products" element={<ProductsCustomFields />} />
          <Route path="invoices" element={<InvoicesCustomFields />} />
          <Route path="payments" element={<PaymentsCustomFields />} />
          <Route path="projects" element={<ProjectsCustomFields />} />
          <Route path="tasks" element={<TasksCustomFields />} />
          <Route path="vendors" element={<VendorsCustomFields />} />
          <Route path="expenses" element={<ExpensesCustomFields />} />
          <Route path="users" element={<UsersCustomFields />} />
        </Route>
        <Route path="generated_numbers">
          <Route path="" element={<GeneratedNumbers />} />
          <Route path="clients" element={<ClientsGeneratedNumbers />} />
          <Route path="invoices" element={<InvoicesGeneratedNumbers />} />
          <Route
            path="recurring_invoices"
            element={<RecurringInvoicesGeneratedNumbers />}
          />
          <Route path="payments" element={<PaymentsGeneratedNumbers />} />
          <Route path="quotes" element={<QuotesGeneratedNumbers />} />
          <Route path="credits" element={<CreditsGeneratedNumbers />} />
          <Route path="projects" element={<ProjectsGeneratedNumbers />} />
        </Route>
      </Route>
      <Route path="/logout" element={<Logout />} />
    </Route>
  </Routes>
);
