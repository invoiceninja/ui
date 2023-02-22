/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Parameters {
  date_range: string;
  show_payments_table: boolean;
  show_aging_table: boolean;
  status: string;
  clients: string[];
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
