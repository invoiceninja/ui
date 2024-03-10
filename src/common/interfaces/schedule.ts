/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Parameters {
  date_range: string;
  show_payments_table: boolean;
  show_credits_table: boolean;
  show_aging_table: boolean;
  only_clients_with_invoices: boolean;
  status: string;
  clients: string[];
  entity: 'invoice' | 'credit' | 'quote' | 'purchase_order';
  entity_id: string;
  report_name: string;
  start_date: string;
  end_date: string;
  product_key: string;
  send_email: boolean;
  is_expense_billed: boolean;
  is_income_billed: boolean;
  include_tax: boolean;
  client_id: string;
  document_email_attachment?: boolean;
  vendors: string;
  categories: string;
  projects: string;
  report_keys: string[];
  include_deleted?: boolean;
}

export interface Schedule {
  id: string;
  name: string;
  frequency_id: string;
  next_run: string;
  template: string;
  is_paused: boolean;
  is_deleted: boolean;
  parameters: Parameters;
  updated_at: number;
  created_at: number;
  archived_at: number;
  remaining_cycles: number;
}
