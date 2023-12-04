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
  report_name?: string;
  date_key?: string;
  start_date?: string;
  end_date?: string;
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
