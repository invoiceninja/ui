/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Transaction {
  id: string;
  account_type: string;
  base_type: string;
  currency_id: string;
  status_id: string;
  amount: number;
  deposit: number;
  withdrawal: number;
  date: string;
  description: string;
  invoices: string;
  expense: string;
}

export interface TransactionInput {
  base_type?: string;
  date?: string;
  amount?: number;
  currency_id?: string;
  bank_integration_id?: string;
  description?: string;
}

export interface TransactionResponse {
  account_type: string;
  amount: number;
  archived_at: number;
  bank_account_id: number;
  bank_integration_id: string;
  base_type: string;
  category_id: number;
  currency_id: string;
  date: string;
  description: string;
  expense_id: string;
  id: string;
  invoice_ids: string;
  is_delete: boolean;
  ninja_category_id: string;
  status_id: string;
  transaction_id: number;
  update_at: number;
  vendor_id: string;
}

export interface TransactionDetails {
  amount?: number;
  date?: string;
  currency_id?: string;
  base_type?: string;
}
