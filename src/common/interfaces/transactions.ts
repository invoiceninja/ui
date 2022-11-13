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
  base_type: string;
  date: string;
  amount: number;
  currency_id: string;
  bank_integration_id: string;
  description: string;
}

export interface TransactionStatus {
  id: string;
  key: string;
}

export interface TransactionDetails {
  amount: number;
  date: string;
  currency_id: string;
}
