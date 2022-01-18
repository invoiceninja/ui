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
  TasksGeneratedNumbers,
  VendorsGeneratedNumbers,
  ExpensesGeneratedNumbers,
  RecurringExpensesGeneratedNumbers,
  EmailSettings,
  ClientPortal,
  TemplatesAndReminders,
  GroupSettings,
  Subscriptions,
  PaymentTerms,
  Settings,
  EditPaymentTerm,
  CreatePaymentTerm,
  CompanyDocuments,
  CreateTaxRate,
  EditTaxRate,
  UserManagement,
  CreateTaskStatus,
  EditTaskStatus,
  ApiTokens,
  CreateApiToken,
  EditApiToken,
  ApiWebhooks,
  CreateApiWebhook,
  EditApiWebhook,
  GoogleAnalytics,
} from '../pages/settings';
import {
  CreateExpenseCategory,
  EditExpenseCategory,
} from 'pages/settings/expense-categories';
import { Client, ClientInvoices, Clients } from 'pages/clients';

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
      <Route path="clients">
        <Route path="" element={<Clients />} />
        <Route path=":id" element={<Client />}>
          <Route path="" element={<ClientInvoices />} />
        </Route>
      </Route>
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
        <Route path="" element={<Settings />} />
        <Route path="company_details">
          <Route path="" element={<CompanyDetails />} />
          <Route path="documents" element={<CompanyDocuments />} />
        </Route>
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
          <Route path="tasks" element={<TasksGeneratedNumbers />} />
          <Route path="vendors" element={<VendorsGeneratedNumbers />} />
          <Route path="expenses" element={<ExpensesGeneratedNumbers />} />
          <Route
            path="recurring_expenses"
            element={<RecurringExpensesGeneratedNumbers />}
          />
        </Route>
        <Route path="email_settings" element={<EmailSettings />} />
        <Route path="client_portal" element={<ClientPortal />} />
        <Route
          path="templates_and_reminders"
          element={<TemplatesAndReminders />}
        />
        <Route path="group_settings" element={<GroupSettings />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="user_management" element={<UserManagement />} />
        <Route path="payment_terms">
          <Route path="" element={<PaymentTerms />} />
          <Route path=":id/edit" element={<EditPaymentTerm />} />
          <Route path="create" element={<CreatePaymentTerm />} />
        </Route>
        <Route path="tax_rates">
          <Route path="create" element={<CreateTaxRate />} />
          <Route path=":id/edit" element={<EditTaxRate />} />
        </Route>
        <Route path="task_statuses">
          <Route path="create" element={<CreateTaskStatus />} />
          <Route path=":id/edit" element={<EditTaskStatus />} />
        </Route>
        <Route path="expense_categories">
          <Route path="create" element={<CreateExpenseCategory />} />
          <Route path=":id/edit" element={<EditExpenseCategory />} />
        </Route>
        <Route path="integrations">
          <Route path="api_tokens">
            <Route path="" element={<ApiTokens />} />
            <Route path="create" element={<CreateApiToken />} />
            <Route path=":id/edit" element={<EditApiToken />} />
          </Route>
          <Route path="api_webhooks">
            <Route path="" element={<ApiWebhooks />} />
            <Route path="create" element={<CreateApiWebhook />} />
            <Route path=":id/edit" element={<EditApiWebhook />} />
          </Route>
          <Route path="google_analytics" element={<GoogleAnalytics />} />
        </Route>
      </Route>
      <Route path="/logout" element={<Logout />} />
    </Route>
  </Routes>
);
