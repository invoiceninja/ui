/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClientContact } from './client-contact';
import { Timestamps } from './timestamps';

interface Meta {
  brand: string;
  exp_month: string;
  exp_year: string;
  last4: string;
  type: number;
}

interface GatewayToken {
  id: string;
  archived_at: number;
  company_gateway_id: string;
  created_at: number;
  gateway_customer_reference: string;
  gateway_type_id: string;
  meta: Meta;
  is_default: boolean;
  is_deleted: boolean;
  token: string;
  updated_at: number;
}

export interface Client extends Timestamps {
  id: string;
  user_id: string;
  assigned_user_id: string;
  name: string;
  website: string;
  private_notes: string;
  balance: number;
  group_settings_id: string;
  paid_to_date: number;
  credit_balance: number;
  last_login: number;
  size_id: string;
  public_notes: string;
  client_hash: string;
  address1: string;
  address2: string;
  phone: string;
  city: string;
  state: string;
  postal_code: string;
  country_id: string;
  industry_id: string;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  shipping_address1: string;
  shipping_address2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country_id: string;
  settings: Record<string, any>;
  is_deleted: boolean;
  vat_number: string;
  id_number: string;
  display_name: string;
  number: string;
  contacts: ClientContact[];
  documents: any[];
  gateway_tokens: GatewayToken[];
}
