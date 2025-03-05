/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Settings {
  general: Record<string, string>;
  requirements: {
    currently_due: string[][];
    past_due: string[][];
    verification: string[][];
  };
  capabilities: Record<string, string>;
}

export interface CompanyGateway {
  id: string;
  gateway_key: string;
  accepted_credit_cards: number;
  require_cvv: boolean;
  require_billing_address: boolean;
  require_shipping_address: boolean;
  require_client_name: boolean;
  require_zip: boolean;
  require_postal_code: boolean;
  require_client_phone: boolean;
  require_contact_name: boolean;
  require_contact_email: boolean;
  show_billing_address: boolean;
  show_shipping_address: boolean;
  update_details: boolean;
  config: string;
  fees_and_limits: Record<string, FeesAndLimitsEntry>;
  updated_at: number;
  archived_at: number;
  created_at: number;
  is_deleted: boolean;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  label: string;
  token_billing: string;
  test_mode: boolean;
  always_show_required_fields: boolean;
  is_default: boolean,
  meta: {
    exp_month: string;
    exp_year: string;
    brand: string;
    last4: string;
    type: number;
  }; 
  settings?: Settings;
}

export interface FeesAndLimitsEntry {
  min_limit: number;
  max_limit: number;
  fee_amount: number;
  fee_percent: number;
  fee_tax_name1: string;
  fee_tax_name2: string;
  fee_tax_name3: string;
  fee_tax_rate1: number;
  fee_tax_rate2: number;
  fee_tax_rate3: number;
  fee_cap: number;
  adjust_fee_percent: boolean;
  is_enabled: boolean;
}
