/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
export interface Statics {
  banks: Bank[];
  countries: Country[];
  currencies: Currency[];
  date_formats: DateeFormat[];
  datetime_formats: DateeFormat[];
  gateways: Gateway[];
  industries: Industry[];
  languages: Language[];
  payment_types: PaymentType[];
  sizes: Industry[];
  timezones: Timezone[];
  templates: Templates;
}

export interface Bank {
  id: string;
  name: string;
  remote_id: string;
  bank_library_id: number;
  config: string;
}

export interface Country {
  id: string;
  capital: null | string;
  citizenship: string;
  country_code: string;
  currency: null | string;
  currency_code: null | string;
  currency_sub_unit: null | string;
  full_name: null | string;
  iso_3166_2: string;
  iso_3166_3: string;
  name: string;
  region_code: string;
  sub_region_code: string;
  eea: boolean;
  swap_postal_code: boolean;
  swap_currency_symbol: boolean;
  thousand_separator: unknown;
  decimal_separator: unknown;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  precision: number;
  thousand_separator: unknown;
  decimal_separator: unknown;
  code: string;
  swap_currency_symbol: boolean;
  exchange_rate: number;
}

export interface DateeFormat {
  id: string;
  format: string;
  format_moment: string;
  format_dart: string;
}

export interface Gateway {
  id: string;
  name: string;
  key: string;
  provider: string;
  visible: boolean;
  sort_order: number;
  site_url: string;
  is_offsite: boolean;
  is_secure: boolean;
  fields: string;
  default_gateway_type_id: string;
  created_at: number;
  updated_at: number;
  options: Record<string | number, Option>;
}

export interface Option {
  refund: boolean;
  token_billing: boolean;
  webhooks?: string[];
}

export interface Industry {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
  locale: string;
}

export interface PaymentType {
  id: string;
  name: string;
  gateway_type_id: number | null;
}

export interface Templates {
  invoice: Credit;
  quote: Credit;
  payment: Credit;
  payment_partial: Credit;
  reminder1: Credit;
  reminder2: Credit;
  reminder3: Credit;
  reminder_endless: Credit;
  statement: Credit;
  credit: Credit;
}

export interface Credit {
  subject: string;
  body: string;
}

export interface Timezone {
  id: string;
  name: string;
  location: string;
  utc_offset: number;
}
