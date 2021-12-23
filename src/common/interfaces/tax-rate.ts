/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  is_deleted: boolean;
  archived_at: number;
  created_at: number;
  updated_at: number;
}
