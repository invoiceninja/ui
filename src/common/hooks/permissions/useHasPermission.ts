/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompanyUser } from '../useCurrentCompanyUser';

type ClientPermissions = 'create_client' | 'view_client' | 'edit_client';
type ProductPermissions = 'create_product' | 'view_product' | 'edit_product';
type InvoicePermissions = 'create_invoice' | 'view_invoice' | 'edit_invoice';
type PaymentPermissions = 'create_payment' | 'view_payment' | 'edit_payment';
type RecurringInvoicePermissions =
  | 'create_recurring_invoice'
  | 'view_recurring_invoice'
  | 'edit_recurring_invoice';
type QuotePermissions = 'create_quote' | 'view_quote' | 'edit_quote';
type CreditPermissions = 'create_credit' | 'view_credit' | 'edit_credit';
type ProjectPermissions = 'create_project' | 'view_project' | 'edit_project';
type TaskPermissions = 'create_task' | 'view_task' | 'edit_task';
type VendorPermissions = 'create_vendor' | 'view_vendor' | 'edit_vendor';
type ExpensePermissions = 'create_expense' | 'view_expense' | 'edit_expense';
type RecurringExpensePermissions =
  | 'create_recurring_expense'
  | 'view_recurring_expense'
  | 'edit_recurring_expense';
type BankTransactionsPermissions =
  | 'create_bank_transaction'
  | 'view_bank_transaction'
  | 'edit_bank_transaction';
type PurchaseOrderPermissions =
  | 'create_purchase_order'
  | 'view_purchase_order'
  | 'edit_purchase_order';

export type Permissions =
  | ClientPermissions
  | ProductPermissions
  | InvoicePermissions
  | PaymentPermissions
  | RecurringInvoicePermissions
  | QuotePermissions
  | CreditPermissions
  | ProjectPermissions
  | TaskPermissions
  | VendorPermissions
  | ExpensePermissions
  | RecurringExpensePermissions
  | BankTransactionsPermissions
  | PurchaseOrderPermissions;

export function useHasPermission() {
  const user = useCurrentCompanyUser();
  const permissions = user?.permissions ?? '';

  return (permission: Permissions) =>
    user?.is_admin || user?.is_owner || permissions.includes(permission);
}

export function useAdmin() {
  const user = useCurrentCompanyUser();

  return {
    isAdmin: Boolean(user?.is_admin),
    isOwner: Boolean(user?.is_owner || user?.is_owner),
  };
}
