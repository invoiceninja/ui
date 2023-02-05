/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Rule {
  field: string;
  operator: string;
  value: string;
}

export interface TransactionRule {
  id: string;
  applies_to: string;
  archived_at: number;
  auto_convert: boolean;
  category_id: string;
  client_id: string;
  created_at: number;
  is_deleted: boolean;
  matches_on_all: boolean;
  name: string;
  rules: Rule[];
  updated_at: number;
  vendor_id: string;
}
