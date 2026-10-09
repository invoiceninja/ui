/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { type ComponentType, lazy } from 'react';
import { Navigate, Outlet, Route } from 'react-router-dom';
import { Guard } from '$app/common/guards/Guard';
import { admin, owner } from '$app/common/guards/guards/admin';
import { companySettings } from '$app/common/guards/guards/company-settings';
import { or } from '$app/common/guards/guards/or';
import { plan } from '$app/common/guards/guards/plan';
import { isDemo, isHosted } from '$app/common/helpers';
import { invoiceDesignRoutes } from '$app/pages/settings/invoice-design/routes';

const lazySettings = (name: keyof typeof import('./index')) =>
  lazy(() =>
    import('./index').then((module) => ({
      default: module[name] as ComponentType,
    }))
  );

const AccentColor = lazySettings('AccentColor');
const AccountManagement = lazySettings('AccountManagement');
const AccountManagementOverview = lazySettings('AccountManagementOverview');
const AccountUsers = lazySettings('AccountUsers');
const Address = lazySettings('Address');
const Analytics = lazySettings('Analytics');
const ApiTokens = lazySettings('ApiTokens');
const ApiWebhooks = lazySettings('ApiWebhooks');
const Authorization = lazySettings('Authorization');
const BankAccount = lazySettings('BankAccount');
const BankAccounts = lazySettings('BankAccounts');
const BillingHistory = lazySettings('BillingHistory');
const ClientPortal = lazySettings('ClientPortal');
const ClientPortalSettings = lazySettings('ClientPortalSettings');
const ClientsCustomFields = lazySettings('ClientsCustomFields');
const ClientsGeneratedNumbers = lazySettings('ClientsGeneratedNumbers');
const CompanyBackup = lazySettings('CompanyBackup');
const CompanyBackupRestore = lazySettings('CompanyBackupRestore');
const CompanyCustomFields = lazySettings('CompanyCustomFields');
const CompanyDetails = lazySettings('CompanyDetails');
const CompanyDetailsCustomFields = lazySettings('CompanyDetailsCustomFields');
const CompanyDocuments = lazySettings('CompanyDocuments');
const CompanyRestore = lazySettings('CompanyRestore');
const Connect = lazySettings('Connect');
const CreateApiToken = lazySettings('CreateApiToken');
const CreateApiWebhook = lazySettings('CreateApiWebhook');
const CreateBankAccount = lazySettings('CreateBankAccount');
const CreateExpenseCategory = lazySettings('CreateExpenseCategory');
const CreateGateway = lazySettings('CreateGateway');
const CreateGroupSettings = lazySettings('CreateGroupSettings');
const CreatePaymentTerm = lazySettings('CreatePaymentTerm');
const CreateSchedule = lazySettings('CreateSchedule');
const CreateSubscription = lazySettings('CreateSubscription');
const CreateTag = lazySettings('CreateTag');
const CreateTaskStatus = lazySettings('CreateTaskStatus');
const CreateTaxRate = lazySettings('CreateTaxRate');
const CreateTransactionRule = lazySettings('CreateTransactionRule');
const CreateUser = lazySettings('CreateUser');
const CreditCustomFields = lazySettings('CreditCustomFields');
const CreditsGeneratedNumbers = lazySettings('CreditsGeneratedNumbers');
const CustomFields = lazySettings('CustomFields');
const CustomLabels = lazySettings('CustomLabels');
const Customize = lazySettings('Customize');
const DangerZone = lazySettings('DangerZone');
const Defaults = lazySettings('Defaults');
const Details = lazySettings('Details');
const EInvoice = lazySettings('EInvoice');
const EditApiToken = lazySettings('EditApiToken');
const EditApiWebhook = lazySettings('EditApiWebhook');
const EditBankAccount = lazySettings('EditBankAccount');
const EditExpenseCategory = lazySettings('EditExpenseCategory');
const EditGateway = lazySettings('EditGateway');
const EditGroupSettings = lazySettings('EditGroupSettings');
const EditPaymentTerm = lazySettings('EditPaymentTerm');
const EditProjectTag = lazySettings('EditProjectTag');
const EditSchedule = lazySettings('EditSchedule');
const EditSubscription = lazySettings('EditSubscription');
const EditTag = lazySettings('EditTag');
const EditTaskStatus = lazySettings('EditTaskStatus');
const EditTaskTag = lazySettings('EditTaskTag');
const EditTaxRate = lazySettings('EditTaxRate');
const EditTransactionRule = lazySettings('EditTransactionRule');
const EditUser = lazySettings('EditUser');
const EmailSettings = lazySettings('EmailSettings');
const EnabledModules = lazySettings('EnabledModules');
const ExpenseSettings = lazySettings('ExpenseSettings');
const ExpensesCustomFields = lazySettings('ExpensesCustomFields');
const ExpensesGeneratedNumbers = lazySettings('ExpensesGeneratedNumbers');
const GeneratedNumbers = lazySettings('GeneratedNumbers');
const GeneratedNumbersSettings = lazySettings('GeneratedNumbersSettings');
const GroupSettings = lazySettings('GroupSettings');
const ImportExport = lazySettings('ImportExport');
const Integrations = lazySettings('Integrations');
const InvoicesCustomFields = lazySettings('InvoicesCustomFields');
const InvoicesGeneratedNumbers = lazySettings('InvoicesGeneratedNumbers');
const KeyboardShortcuts = lazySettings('KeyboardShortcuts');
const Localization = lazySettings('Localization');
const LocalizationSettings = lazySettings('LocalizationSettings');
const Logo = lazySettings('Logo');
const Messages = lazySettings('Messages');
const Notifications = lazySettings('Notifications');
const OnlinePayments = lazySettings('OnlinePayments');
const Password = lazySettings('Password');
const PaymentTerms = lazySettings('PaymentTerms');
const PaymentsCustomFields = lazySettings('PaymentsCustomFields');
const PaymentsGeneratedNumbers = lazySettings('PaymentsGeneratedNumbers');
const Plan = lazySettings('Plan');
const Plan3 = lazySettings('Plan3');
const Preferences = lazySettings('Preferences');
const ProductSettings = lazySettings('ProductSettings');
const ProductsCustomFields = lazySettings('ProductsCustomFields');
const ProjectsCustomFields = lazySettings('ProjectsCustomFields');
const ProjectsGeneratedNumbers = lazySettings('ProjectsGeneratedNumbers');
const PurchaseOrdersGeneratedNumbers = lazySettings(
  'PurchaseOrdersGeneratedNumbers'
);
const QuotesCustomFields = lazySettings('QuotesCustomFields');
const QuotesGeneratedNumbers = lazySettings('QuotesGeneratedNumbers');
const RecurringExpensesGeneratedNumbers = lazySettings(
  'RecurringExpensesGeneratedNumbers'
);
const RecurringInvoicesGeneratedNumbers = lazySettings(
  'RecurringInvoicesGeneratedNumbers'
);
const ReferralProgram = lazySettings('ReferralProgram');
const Registration = lazySettings('Registration');
const Schedules = lazySettings('Schedules');
const SecuritySettings = lazySettings('SecuritySettings');
const Settings = lazySettings('Settings');
const Subscriptions = lazySettings('Subscriptions');
const SystemLog = lazySettings('SystemLog');
const Tags = lazySettings('Tags');
const TaskSettings = lazySettings('TaskSettings');
const TasksCustomFields = lazySettings('TasksCustomFields');
const TasksGeneratedNumbers = lazySettings('TasksGeneratedNumbers');
const TaxSettings = lazySettings('TaxSettings');
const TemplatesAndReminders = lazySettings('TemplatesAndReminders');
const TransactionRules = lazySettings('TransactionRules');
const TwoFactorAuthentication = lazySettings('TwoFactorAuthentication');
const UserCustomFields = lazySettings('UserCustomFields');
const UserDetails = lazySettings('UserDetails');
const UserDetailsComponent = lazySettings('UserDetailsComponent');
const Users = lazySettings('Users');
const UsersCustomFields = lazySettings('UsersCustomFields');
const VendorsCustomFields = lazySettings('VendorsCustomFields');
const VendorsGeneratedNumbers = lazySettings('VendorsGeneratedNumbers');
const WorkflowSettings = lazySettings('WorkflowSettings');

export const settingsRoutes = (
  <Route path="/settings">
    <Route path="user_details" element={<UserDetails />}>
      <Route path="" element={<UserDetailsComponent />} />
      <Route path="password" element={<Password />} />
      <Route path="connect" element={<Connect />} />
      <Route path="accent_color" element={<AccentColor />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="enable_two_factor" element={<TwoFactorAuthentication />} />
      <Route path="custom_fields" element={<UserCustomFields />} />
      <Route path="preferences" element={<Preferences />} />
      <Route path="keyboard_shortcuts" element={<KeyboardShortcuts />} />
    </Route>

    <Route element={<Guard guards={[admin()]} component={<Outlet />} />}>
      <Route path="" element={<Settings />} />
      <Route path="company_details" element={<CompanyDetails />}>
        <Route path="" element={<Details />} />
        <Route path="address" element={<Address />} />
        <Route path="logo" element={<Logo />} />
        <Route path="defaults" element={<Defaults />} />
        <Route path="documents" element={<CompanyDocuments />} />
        <Route path="custom_fields" element={<CompanyDetailsCustomFields />} />
      </Route>
      <Route path="localization" element={<Localization />}>
        <Route path="" element={<LocalizationSettings />} />
        <Route path="custom_labels" element={<CustomLabels />} />
      </Route>
      <Route path="online_payments" element={<OnlinePayments />} />
      <Route path="tax_settings" element={<TaxSettings />} />
      <Route path="product_settings" element={<ProductSettings />} />
      <Route path="task_settings" element={<TaskSettings />} />
      <Route path="tags">
        <Route path="" element={<Tags />} />
        <Route path="create" element={<CreateTag />} />
        <Route path=":id/edit" element={<EditTag />} />
        <Route
          path="projects"
          element={<Navigate to="/settings/tags" replace />}
        />
        <Route
          path="tasks/create"
          element={<Navigate to="/settings/tags/create" replace />}
        />
        <Route path="tasks/:id/edit" element={<EditTaskTag />} />
        <Route
          path="projects/create"
          element={<Navigate to="/settings/tags/create" replace />}
        />
        <Route path="projects/:id/edit" element={<EditProjectTag />} />
      </Route>
      <Route path="expense_settings" element={<ExpenseSettings />} />
      <Route path="workflow_settings" element={<WorkflowSettings />} />
      <Route path="import_export" element={<ImportExport />} />
      <Route path="account_management" element={<AccountManagement />}>
        <Route
          path=""
          element={
            import.meta.env.VITE_ENABLE_NEW_ACCOUNT_MANAGEMENT === 'true' ||
            isHosted() ? (
              <Guard guards={[owner()]} component={<Plan3 />} type="subPage" />
            ) : (
              <Plan />
            )
          }
        />

        <Route path="overview" element={<AccountManagementOverview />} />
        {(import.meta.env.VITE_ENABLE_NEW_ACCOUNT_MANAGEMENT === 'true' ||
          isHosted()) && (
          <>
            <Route
              path="users"
              element={
                <Guard
                  guards={[owner()]}
                  component={<AccountUsers />}
                  type="subPage"
                />
              }
            />
            <Route
              path="billing_history"
              element={
                <Guard
                  guards={[owner()]}
                  component={<BillingHistory />}
                  type="subPage"
                />
              }
            />
          </>
        )}
        <Route path="enabled_modules" element={<EnabledModules />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="security_settings" element={<SecuritySettings />} />
        <Route path="referral_program" element={<ReferralProgram />} />
        {!isDemo() && <Route path="danger_zone" element={<DangerZone />} />}
      </Route>
      <Route path="backup_restore" element={<CompanyBackupRestore />}>
        <Route path="" element={<CompanyBackup />} />
        <Route path="restore" element={<CompanyRestore />} />
      </Route>
      <Route path="custom_fields" element={<CustomFields />}>
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
        {/* <Route path="quotes" element={<QuotesCustomFields />} /> */}
        {/* <Route path="credits" element={<CreditCustomFields />} /> */}
      </Route>
      <Route path="generated_numbers" element={<GeneratedNumbers />}>
        <Route path="" element={<GeneratedNumbersSettings />} />
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
        <Route
          path="purchase_orders"
          element={<PurchaseOrdersGeneratedNumbers />}
        />
        <Route path="expenses" element={<ExpensesGeneratedNumbers />} />
        <Route
          path="recurring_expenses"
          element={<RecurringExpensesGeneratedNumbers />}
        />
      </Route>
      <Route path="client_portal" element={<ClientPortal />}>
        <Route path="" element={<ClientPortalSettings />} />
        <Route path="authorization" element={<Authorization />} />
        <Route path="registration" element={<Registration />} />
        <Route path="messages" element={<Messages />} />
        <Route path="customize" element={<Customize />} />
      </Route>
      <Route
        path="e_invoice"
        element={
          <Guard guards={[companySettings()]} component={<EInvoice />} />
        }
      />
      <Route path="email_settings" element={<EmailSettings />} />
      <Route
        path="templates_and_reminders"
        element={<TemplatesAndReminders />}
      />
      <Route path="bank_accounts">
        <Route path="" element={<BankAccounts />} />
        <Route path=":id/details" element={<BankAccount />} />
        <Route path="create" element={<CreateBankAccount />} />
        <Route path=":id/edit" element={<EditBankAccount />} />
      </Route>
      <Route path="group_settings">
        <Route path="" element={<GroupSettings />} />
        <Route path="create" element={<CreateGroupSettings />} />
        <Route path=":id/edit" element={<EditGroupSettings />} />
      </Route>
      <Route path="subscriptions">
        <Route path="" element={<Subscriptions />} />
        <Route path="create" element={<CreateSubscription />} />
        <Route path=":id/edit" element={<EditSubscription />} />
      </Route>
      <Route path="schedules">
        <Route path="" element={<Schedules />} />
        <Route path="create" element={<CreateSchedule />} />
        <Route path=":id/edit" element={<EditSchedule />} />
      </Route>
      <Route path="users">
        <Route path="" element={<Users />} />
        <Route path="create" element={<CreateUser />} />
        <Route
          path=":id/edit"
          element={
            <Guard guards={[plan('enterprise')]} component={<EditUser />} />
          }
        />
      </Route>

      {!isDemo() && (
        <Route path="/settings/system_logs">
          <Route path="" element={<SystemLog />} />
        </Route>
      )}

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
          <Route
            path=""
            element={
              <Guard
                guards={[or(plan('enterprise'), plan('pro')), admin()]}
                component={<ApiTokens />}
              />
            }
          />
          <Route
            path="create"
            element={
              <Guard
                guards={[or(plan('enterprise'), plan('pro')), admin()]}
                component={<CreateApiToken />}
              />
            }
          />
          <Route
            path=":id/edit"
            element={
              <Guard
                guards={[or(plan('enterprise'), plan('pro')), admin()]}
                component={<EditApiToken />}
              />
            }
          />
        </Route>
        <Route path="api_webhooks">
          <Route path="" element={<ApiWebhooks />} />
          <Route path="create" element={<CreateApiWebhook />} />
          <Route path=":id/edit" element={<EditApiWebhook />} />
        </Route>
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="gateways">
        <Route path="create" element={<CreateGateway />} />
        <Route path=":id/edit" element={<EditGateway />} />
      </Route>
      <Route path="bank_accounts/transaction_rules">
        <Route path="" element={<TransactionRules />} />
        <Route path="create" element={<CreateTransactionRule />} />
        <Route path=":id/edit" element={<EditTransactionRule />} />
      </Route>

      {invoiceDesignRoutes}
    </Route>
  </Route>
);
