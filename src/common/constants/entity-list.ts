/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export default [
  {
    key: 'new_client',
    permission: 'create_client',
    url: '/clients/create',
  },
  {
    key: 'new_product',
    permission: 'create_product',
    url: '/products/create',
  },
  {
    key: 'new_invoice',
    permission: 'create_invoice',
    url: '/invoices/create',
  },
  {
    key: 'new_recurring_invoice',
    permission: 'create_recurring_invoice',
    url: '/recurring_invoices/create',
  },
  {
    key: 'new_payment',
    permission: 'create_payment',
    url: '/payments/create',
  },
  {
    key: 'new_quote',
    permission: 'create_quote',
    url: '/quotes/create',
  },
  {
    key: 'new_credit',
    permission: 'create_credit',
    url: '/credits/create',
  },
  {
    key: 'new_project',
    permission: 'create_project',
    url: '/projects/create',
  },
  {
    key: 'new_task',
    permission: 'create_task',
    url: '/tasks/create',
  },
  {
    key: 'new_vendor',
    permission: 'create_vendor',
    url: '/vendors/create',
  },
  {
    key: 'new_purchase_order',
    permission: 'create_purchase_order',
    url: '/purchase_orders/create',
  },
  {
    key: 'new_expense',
    permission: 'create_expense',
    url: '/expenses/create',
  },
  {
    key: 'new_recurring_expense',
    permission: 'create_recurring_expense',
    url: '/recurring_expenses/create',
  },
  {
    key: 'new_transaction',
    permission: 'create_transaction',
    url: '/transactions/create',
  },
  {
    key: 'new_company_gateway',
    permission: 'create_online_payment',
    url: '/online_payments/create',
  },
  {
    key: 'new_tax_rate',
    permission: 'create_tax_rate',
    url: '/tax_rates/create',
  },
  {
    key: 'new_task_status',
    permission: 'create_task_status',
    url: '/task_statuses/create',
  },
  {
    key: 'new_expense_category',
    permission: 'create_expense_category',
    url: '/expense_categories/create',
  },
  {
    key: 'new_bank_account',
    permission: 'create_bank_account',
    url: '/bank_accounts/create',
  },
  {
    key: 'new_user',
    permission: 'create_user',
    url: '/users/create',
  },
];
