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
      <Route path="clients">
        <Route path="" element={<Clients.Clients />} />
        <Route path="create" element={<Clients.Create />} />
        <Route path=":id/edit" element={<Clients.Edit />} />
        <Route path=":id" element={<Clients.Client />}>
          <Route path="" element={<Clients.Invoices />} />
          <Route path="quotes" element={<Clients.Quotes />} />
          <Route path="payments" element={<Clients.Payments />} />
          <Route
            path="recurring_invoices"
            element={<Clients.RecurringInvoices />}
          />
          <Route path="credits" element={<Clients.Credits />} />
          <Route path="projects" element={<Clients.Projects />} />
          <Route path="tasks" element={<Clients.Tasks />} />
          <Route path="expenses" element={<Clients.Expenses />} />
          <Route
            path="recurring_expenses"
            element={<Clients.RecurringExpenses />}
          />
        </Route>
      </Route>
      <Route path="products">
        <Route path="" element={<Products.Products />} />
        <Route path="create" element={<Products.Create />} />
        <Route path=":id" element={<Products.Product />}>
          <Route path="" element={<Products.Show />} />
          <Route path="edit" element={<Products.Edit />} />
          <Route path="clone" element={<Products.Clone />} />
          <Route path="documents" element={<Products.Documents />} />
        </Route>
      </Route>
      <Route path="/invoices">
        <Route path="" element={<Invoices.Invoices />} />
        <Route path="create" element={<Invoices.Create />} />
        <Route path=":id/edit" element={<Invoices.Edit />} />
      </Route>
      <Route path="/recurring_invoices">
        <Route path="" element={<RecurringInvoices.RecurringInvoices />} />
        <Route path=":id/edit" element={<RecurringInvoices.Edit />} />
      </Route>
      <Route path="/payments">
        <Route path="" element={<Payments.Payments />} />

        <Route path=":id/edit" element={<Payments.Edit />} />
      </Route>
      <Route path="/credits">
        <Route path="" element={<Credits.Credits />} />
      </Route>
      <Route path="/projects">
        <Route path="" element={<Projects.Projects />} />
      </Route>
      <Route path="/vendors">
        <Route path="" element={<Vendors.Vendors />} />
        <Route path="create" element={<Vendors.Create />} />

        <Route path=":id" element={<Vendors.Vendor />}>
          <Route path="" element={<Vendors.Show />} />
          <Route path="edit" element={<Vendors.Edit />} />

          <Route
            path="recurring_expenses"
            element={<Vendors.RecurringExpenses />}
          />

          <Route path="expenses" element={<Vendors.Expenses />} />
        </Route>
      </Route>
      <Route path="/expenses">
        <Route path="" element={<Expenses.Expenses />} />
      </Route>
      <Route path="/recurring_expenses">
        <Route path="" element={<RecurringExpenses.RecurringExpenses />} />
      </Route>
      <Route path="/settings">
        <Route path="" element={<Settings.Settings />} />
        <Route path="company_details">
          <Route path="" element={<Settings.CompanyDetails />} />
          <Route path="documents" element={<Settings.CompanyDocuments />} />
        </Route>
        <Route path="user_details" element={<Settings.UserDetails />} />
        <Route path="localization" element={<Settings.Localization />} />
        <Route path="online_payments" element={<Settings.OnlinePayments />} />
        <Route path="tax_settings" element={<Settings.TaxSettings />} />
        <Route path="product_settings" element={<Settings.ProductSettings />} />
        <Route path="task_settings" element={<Settings.TaskSettings />} />
        <Route path="expense_settings" element={<Settings.ExpenseSettings />} />
        <Route
          path="workflow_settings"
          element={<Settings.WorkflowSettings />}
        />
        <Route path="import_export" element={<Settings.ImportExport />} />
        <Route
          path="account_management"
          element={<Settings.AccountManagement />}
        />
        <Route path="invoice_design" element={<Settings.InvoiceDesign />} />
        <Route
          path="invoice_design/customize"
          element={<Settings.Customize />}
        />
        <Route path="custom_fields">
          <Route path="" element={<Settings.CustomFields />} />
          <Route path="company" element={<Settings.CompanyCustomFields />} />
          <Route path="clients" element={<Settings.ClientsCustomFields />} />
          <Route path="products" element={<Settings.ProductsCustomFields />} />
          <Route path="invoices" element={<Settings.InvoicesCustomFields />} />
          <Route path="payments" element={<Settings.PaymentsCustomFields />} />
          <Route path="projects" element={<Settings.ProjectsCustomFields />} />
          <Route path="tasks" element={<Settings.TasksCustomFields />} />
          <Route path="vendors" element={<Settings.VendorsCustomFields />} />
          <Route path="expenses" element={<Settings.ExpensesCustomFields />} />
          <Route path="users" element={<Settings.UsersCustomFields />} />
        </Route>
        <Route path="generated_numbers">
          <Route path="" element={<Settings.GeneratedNumbers />} />
          <Route
            path="clients"
            element={<Settings.ClientsGeneratedNumbers />}
          />
          <Route
            path="invoices"
            element={<Settings.InvoicesGeneratedNumbers />}
          />
          <Route
            path="recurring_invoices"
            element={<Settings.RecurringInvoicesGeneratedNumbers />}
          />
          <Route
            path="payments"
            element={<Settings.PaymentsGeneratedNumbers />}
          />
          <Route path="quotes" element={<Settings.QuotesGeneratedNumbers />} />
          <Route
            path="credits"
            element={<Settings.CreditsGeneratedNumbers />}
          />
          <Route
            path="projects"
            element={<Settings.ProjectsGeneratedNumbers />}
          />
          <Route path="tasks" element={<Settings.TasksGeneratedNumbers />} />
          <Route
            path="vendors"
            element={<Settings.VendorsGeneratedNumbers />}
          />
          <Route
            path="expenses"
            element={<Settings.ExpensesGeneratedNumbers />}
          />
          <Route
            path="recurring_expenses"
            element={<Settings.RecurringExpensesGeneratedNumbers />}
          />
        </Route>
        <Route path="email_settings" element={<Settings.EmailSettings />} />
        <Route path="client_portal" element={<Settings.ClientPortal />} />
        <Route
          path="templates_and_reminders"
          element={<Settings.TemplatesAndReminders />}
        />
        <Route path="group_settings" element={<Settings.GroupSettings />} />
        <Route path="subscriptions" element={<Settings.Subscriptions />} />
        <Route path="user_management" element={<Settings.UserManagement />} />
        <Route path="payment_terms">
          <Route path="" element={<Settings.PaymentTerms />} />
          <Route path=":id/edit" element={<Settings.EditPaymentTerm />} />
          <Route path="create" element={<Settings.CreatePaymentTerm />} />
        </Route>
        <Route path="tax_rates">
          <Route path="create" element={<Settings.CreateTaxRate />} />
          <Route path=":id/edit" element={<Settings.EditTaxRate />} />
        </Route>
        <Route path="task_statuses">
          <Route path="create" element={<Settings.CreateTaskStatus />} />
          <Route path=":id/edit" element={<Settings.EditTaskStatus />} />
        </Route>
        <Route path="expense_categories">
          <Route path="create" element={<Settings.CreateExpenseCategory />} />
          <Route path=":id/edit" element={<Settings.EditExpenseCategory />} />
        </Route>
        <Route path="integrations">
          <Route path="api_tokens">
            <Route path="" element={<Settings.ApiTokens />} />
            <Route path="create" element={<Settings.CreateApiToken />} />
            <Route path=":id/edit" element={<Settings.EditApiToken />} />
          </Route>
          <Route path="api_webhooks">
            <Route path="" element={<Settings.ApiWebhooks />} />
            <Route path="create" element={<Settings.CreateApiWebhook />} />
            <Route path=":id/edit" element={<Settings.EditApiWebhook />} />
          </Route>
          <Route
            path="google_analytics"
            element={<Settings.GoogleAnalytics />}
          />
        </Route>
      </Route>
      <Route path="/logout" element={<Authentication.Logout />} />
    </Route>
  </Routes>
);
