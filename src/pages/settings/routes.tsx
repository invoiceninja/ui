/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from 'common/guards/Guard';
import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { Route } from 'react-router-dom';
import * as Settings from './index';

export const settingsRoutes = (
  <Route path="/settings">
    <Route path="" element={<Settings.Settings />} />
    <Route path="company_details" element={<Settings.CompanyDetails />}>
      <Route path="" element={<Settings.Details />} />
      <Route path="address" element={<Settings.Address />} />
      <Route path="logo" element={<Settings.Logo />} />
      <Route path="defaults" element={<Settings.Defaults />} />
      <Route path="documents" element={<Settings.CompanyDocuments />} />
      <Route
        path="custom_fields"
        element={<Settings.CompanyDetailsCustomFields />}
      />
    </Route>
    <Route path="user_details" element={<Settings.UserDetails />}>
      <Route path="" element={<Settings.UserDetailsComponent />} />
      <Route path="password" element={<Settings.Password />} />
      <Route path="connect" element={<Settings.Connect />} />
      <Route path="accent_color" element={<Settings.AccentColor />} />
      <Route path="notifications" element={<Settings.Notifications />} />
      <Route
        path="enable_two_factor"
        element={<Settings.TwoFactorAuthentication />}
      />
      <Route path="custom_fields" element={<Settings.UserCustomFields />} />
    </Route>
    <Route path="localization" element={<Settings.Localization />}>
      <Route path="" element={<Settings.LocalizationSettings />} />
      <Route path="custom_labels" element={<Settings.CustomLabels />} />
    </Route>
    <Route path="online_payments" element={<Settings.OnlinePayments />} />
    <Route path="tax_settings" element={<Settings.TaxSettings />} />
    <Route path="product_settings" element={<Settings.ProductSettings />} />
    <Route path="task_settings" element={<Settings.TaskSettings />} />
    <Route path="expense_settings" element={<Settings.ExpenseSettings />} />
    <Route path="workflow_settings" element={<Settings.WorkflowSettings />} />
    <Route path="import_export" element={<Settings.ImportExport />} />
    <Route path="account_management" element={<Settings.AccountManagement />} />
    <Route path="backup_restore" element={<Settings.CompanyBackupRestore />}>
      <Route path="" element={<Settings.CompanyBackup />} />
      <Route path="restore" element={<Settings.CompanyRestore />} />
    </Route>
    <Route path="invoice_design" element={<Settings.InvoiceDesign />} />
    <Route path="invoice_design/customize" element={<Settings.Customize />} />
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
    <Route path="generated_numbers" element={<Settings.GeneratedNumbers />}>
      <Route path="" element={<Settings.GeneratedNumbersSettings />} />
      <Route path="clients" element={<Settings.ClientsGeneratedNumbers />} />
      <Route path="invoices" element={<Settings.InvoicesGeneratedNumbers />} />
      <Route
        path="recurring_invoices"
        element={<Settings.RecurringInvoicesGeneratedNumbers />}
      />
      <Route path="payments" element={<Settings.PaymentsGeneratedNumbers />} />
      <Route path="quotes" element={<Settings.QuotesGeneratedNumbers />} />
      <Route path="credits" element={<Settings.CreditsGeneratedNumbers />} />
      <Route path="projects" element={<Settings.ProjectsGeneratedNumbers />} />
      <Route path="tasks" element={<Settings.TasksGeneratedNumbers />} />
      <Route path="vendors" element={<Settings.VendorsGeneratedNumbers />} />
      <Route
        path="purchase_orders"
        element={<Settings.PurchaseOrdersGeneratedNumbers />}
      />
      <Route path="expenses" element={<Settings.ExpensesGeneratedNumbers />} />
      <Route
        path="recurring_expenses"
        element={<Settings.RecurringExpensesGeneratedNumbers />}
      />
    </Route>
    <Route path="client_portal" element={<Settings.ClientPortal />} />
    <Route path="email_settings" element={<Settings.EmailSettings />} />
    <Route
      path="templates_and_reminders"
      element={<Settings.TemplatesAndReminders />}
    />
    <Route path="bank_accounts">
      <Route path="" element={<Settings.BankAccounts />} />
      <Route path=":id/details" element={<Settings.BankAccount />} />
      <Route path="create" element={<Settings.CreateBankAccount />} />
      <Route path=":id/edit" element={<Settings.EditBankAccount />} />
    </Route>

    <Route path="bank_accounts/transaction_rules">
      <Route path="" element={<Settings.TransactionRules />} />
      <Route path="create" element={<Settings.CreateTransactionRule />} />
      <Route path=":id/edit" element={<Settings.EditTransactionRule />} />
    </Route>

    <Route path="group_settings" element={<Settings.GroupSettings />} />
    <Route path="subscriptions">
      <Route path="" element={<Settings.Subscriptions />} />
      <Route path="create" element={<Settings.CreateSubscription />} />
      <Route path=":id/edit" element={<Settings.EditSubscription />} />
    </Route>
    <Route path="users">
      <Route path="" element={<Settings.Users />} />
      <Route path="create" element={<Settings.CreateUser />} />
      <Route
        path=":id/edit"
        element={
          <Guard
            guards={[() => enterprisePlan()]}
            component={<Settings.EditUser />}
          />
        }
      />
    </Route>
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
      <Route path="analytics" element={<Settings.Analytics />} />
    </Route>
    <Route path="gateways">
      <Route path="create" element={<Settings.CreateGateway />} />
      <Route path=":id/edit" element={<Settings.EditGateway />} />
    </Route>
  </Route>
);
