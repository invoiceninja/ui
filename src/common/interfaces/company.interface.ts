/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Company {
  id: string;
  size_id: string;
  industry_id: string;
  settings: Settings;
  custom_fields: Record<string, string>;
  enabled_tax_rates: number;
  enabled_item_tax_rates: number;
  enable_product_discount: boolean;
  mark_expenses_paid: boolean;
  mark_expenses_invoiceable: boolean;
  invoice_expense_documents: boolean;
  convert_expense_currency: boolean;
  custom_surcharge_taxes1: boolean;
  custom_surcharge_taxes2: boolean;
  custom_surcharge_taxes3: boolean;
  custom_surcharge_taxes4: boolean;
  portal_domain: string;
  enable_product_cost: boolean;
  enable_product_quantity: boolean;
  show_task_end_date: boolean;
  auto_start_tasks: boolean;
  use_quote_terms_on_conversion: boolean;
  is_disabled: boolean;
  enable_applying_payments: boolean;
  enabled_expense_tax_rates: number;
  stock_notification: boolean;
  invoice_task_lock: boolean;
  invoice_task_hours: boolean;
  invoice_task_project: boolean;
  track_inventory: boolean;
  stop_on_unpaid_recurring: boolean;
  enabled_modules: number;
  calculate_taxes: boolean;
  tax_data: TaxData;
  e_invoice_certificate: string;
  e_invoice_passphrase: string;
  has_e_invoice_certificate: boolean;
  has_e_invoice_certificate_passphrase: boolean;
  default_password_timeout: number;
  default_quantity: boolean;
  subdomain: string;
  client_can_register: boolean;
  invoice_task_item_description: boolean;
  show_tasks_table: boolean;
  invoice_task_datelog: boolean;
  invoice_task_timelog: boolean;
  invoice_task_locked: boolean;
  invoice_task_documents: boolean;
  oauth_password_required: boolean;
  first_month_of_year: string;
  company_key: string;
  fill_products: boolean;
}

export interface CompanyInput {
  name: string;
  subdomain: string;
  language_id: string;
  currency_id: string;
}

export interface Settings {
  accept_client_input_quote_approval: boolean;
  auto_archive_invoice: boolean;
  auto_bill_standard_invoices: boolean;
  lock_invoices: string;
  enable_client_portal_tasks: boolean;
  show_all_tasks_client_portal: string;
  enable_client_portal_password: boolean;
  enable_client_portal: boolean;
  enable_client_portal_dashboard: boolean;
  signature_on_pdf: boolean;
  document_email_attachment: boolean;
  portal_design_id: string;
  timezone_id: string;
  date_format_id: string;
  military_time: boolean;
  language_id: string;
  show_currency_code: boolean;
  show_task_item_description: boolean;
  allow_billable_task_items: boolean;
  show_email_footer: boolean;
  company_gateway_ids: string;
  currency_id: string;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  default_task_rate: number;
  payment_terms: string;
  send_reminders: boolean;
  custom_message_dashboard: string;
  custom_message_unpaid_invoice: string;
  custom_message_paid_invoice: string;
  custom_message_unapproved_quote: string;
  auto_archive_quote: boolean;
  auto_convert_quote: boolean;
  auto_email_invoice: boolean;
  entity_send_time: number;
  inclusive_taxes: boolean;
  quote_footer: string;
  translations: any[];
  counter_number_applied: string;
  quote_number_applied: string;
  invoice_number_pattern: string;
  invoice_number_counter: number;
  recurring_invoice_number_pattern: string;
  recurring_invoice_number_counter: number;
  quote_number_pattern: string;
  quote_number_counter: number;
  client_number_pattern: string;
  client_number_counter: number;
  credit_number_pattern: string;
  credit_number_counter: number;
  task_number_pattern: string;
  task_number_counter: number;
  expense_number_pattern: string;
  expense_number_counter: number;
  recurring_expense_number_pattern: string;
  recurring_expense_number_counter: number;
  recurring_quote_number_pattern: string;
  recurring_quote_number_counter: number;
  vendor_number_pattern: string;
  vendor_number_counter: number;
  ticket_number_pattern: string;
  ticket_number_counter: number;
  payment_number_pattern: string;
  payment_number_counter: number;
  project_number_pattern: string;
  project_number_counter: number;
  postmark_secret: string;
  mailgun_secret: string;
  mailgun_domain: string;
  mailgun_endpoint: string;
  purchase_order_number_pattern: string;
  purchase_order_number_counter: number;
  shared_invoice_quote_counter: boolean;
  shared_invoice_credit_counter: boolean;
  recurring_number_prefix: string;
  reset_counter_frequency_id: number;
  reset_counter_date: string;
  counter_padding: number;
  auto_bill: string;
  auto_bill_date: string;
  invoice_terms: string;
  quote_terms: string;
  invoice_taxes: number;
  invoice_design_id: string;
  quote_design_id: string;
  credit_design_id: string;
  purchase_order_design_id: string;
  purchase_order_footer: string;
  purchase_order_terms: string;
  purchase_order_public_notes: string;
  require_purchase_order_signature: boolean;
  invoice_footer: string;
  credit_footer: string;
  credit_terms: string;
  invoice_labels: string;
  tax_name1: string;
  tax_rate1: number;
  tax_name2: string;
  tax_rate2: number;
  tax_name3: string;
  tax_rate3: number;
  payment_type_id: string;
  valid_until: string;
  show_accept_invoice_terms: boolean;
  show_accept_quote_terms: boolean;
  require_invoice_signature: boolean;
  require_quote_signature: boolean;
  email_sending_method: string;
  gmail_sending_user_id: string;
  reply_to_email: string;
  reply_to_name: string;
  bcc_email: string;
  pdf_email_attachment: boolean;
  ubl_email_attachment: boolean;
  email_style: string;
  email_style_custom: string;
  email_subject_invoice: string;
  email_subject_quote: string;
  email_subject_credit: string;
  email_subject_payment: string;
  email_subject_payment_partial: string;
  email_subject_statement: string;
  email_subject_purchase_order: string;
  email_template_purchase_order: string;
  email_template_invoice: string;
  email_template_credit: string;
  email_template_quote: string;
  email_template_payment: string;
  email_template_payment_partial: string;
  email_template_statement: string;
  email_subject_reminder1: string;
  email_subject_reminder2: string;
  email_subject_reminder3: string;
  email_subject_reminder_endless: string;
  email_template_reminder1: string;
  email_template_reminder2: string;
  email_template_reminder3: string;
  email_template_reminder_endless: string;
  email_signature: string;
  enable_email_markup: boolean;
  email_subject_custom1: string;
  email_subject_custom2: string;
  email_subject_custom3: string;
  email_template_custom1: string;
  email_template_custom2: string;
  email_template_custom3: string;
  enable_reminder1: boolean;
  enable_reminder2: boolean;
  enable_reminder3: boolean;
  enable_reminder_endless?: boolean;
  num_days_reminder1: number;
  num_days_reminder2: number;
  num_days_reminder3: number;
  schedule_reminder1: string;
  schedule_reminder2: string;
  schedule_reminder3: string;
  reminder_send_time: number;
  late_fee_amount1: number;
  late_fee_amount2: number;
  late_fee_amount3: number;
  late_fee_percent1: number;
  late_fee_percent2: number;
  late_fee_percent3: number;
  endless_reminder_frequency_id?: string;
  late_fee_endless_amount: number;
  late_fee_endless_percent: number;
  client_online_payment_notification: boolean;
  client_manual_payment_notification: boolean;
  name: string;
  company_logo: string;
  website: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email: string;
  country_id: string;
  vat_number: string;
  id_number: string;
  page_size: string;
  page_layout: string;
  font_size: number;
  primary_font: string;
  secondary_font: string;
  primary_color: string;
  secondary_color: string;
  page_numbering: boolean;
  page_numbering_alignment: string;
  hide_paid_to_date: boolean;
  embed_documents: boolean;
  all_pages_header: boolean;
  all_pages_footer: boolean;
  pdf_variables: { [key: string]: string[] };
  portal_custom_head: string;
  portal_custom_css: string;
  portal_custom_footer: string;
  portal_custom_js: string;
  client_can_register: boolean;
  client_portal_terms: string;
  client_portal_privacy_policy: string;
  client_portal_enable_uploads: boolean;
  client_portal_allow_under_payment: boolean;
  client_portal_under_payment_minimum: number;
  client_portal_allow_over_payment: boolean;
  use_credits_payment: string;
  hide_empty_columns_on_pdf: boolean;
  email_from_name: string;
  auto_archive_invoice_cancelled: boolean;
  use_comma_as_decimal_place: boolean;
  first_month_of_year: string;
  qr_iban: string;
  besr_id: string;
  vendor_portal_enable_uploads: boolean;
  company_logo_size: string;
  show_paid_stamp: boolean;
  show_shipping_address: boolean;
  sync_invoice_quote_columns: boolean;
  client_initiated_payments: boolean;
  client_initiated_payments_minimum: number;
  e_invoice_type: string;
  default_expense_payment_type_id: string;
  enable_e_invoice: boolean;
  send_email_on_mark_paid: boolean;
  classification: string;
  payment_email_all_contacts: boolean;
}

export interface TaxData {
  version: string;
  seller_subregion: string;
  regions: Regions;
}

export interface Regions {
  US: USRegion;
  EU: EURegion;
  AU: AURegion;
}

export interface USRegion {
  has_sales_above_threshold: boolean;
  tax_all_subregions: boolean;
  tax_threshold: number;
  subregions: USSubregion;
}

export interface USSubregion {
  AL: TaxSetting;
  AK: TaxSetting;
  AZ: TaxSetting;
  AR: TaxSetting;
  CA: TaxSetting;
  CO: TaxSetting;
  CT: TaxSetting;
  DE: TaxSetting;
  FL: TaxSetting;
  GA: TaxSetting;
  HI: TaxSetting;
  ID: TaxSetting;
  IL: TaxSetting;
  IN: TaxSetting;
  IA: TaxSetting;
  KS: TaxSetting;
  KY: TaxSetting;
  LA: TaxSetting;
  ME: TaxSetting;
  MD: TaxSetting;
  MA: TaxSetting;
  MI: TaxSetting;
  MN: TaxSetting;
  MS: TaxSetting;
  MO: TaxSetting;
  MT: TaxSetting;
  NE: TaxSetting;
  NV: TaxSetting;
  NH: TaxSetting;
  NJ: TaxSetting;
  NM: TaxSetting;
  NY: TaxSetting;
  NC: TaxSetting;
  ND: TaxSetting;
  OH: TaxSetting;
  OK: TaxSetting;
  OR: TaxSetting;
  PA: TaxSetting;
  RI: TaxSetting;
  SC: TaxSetting;
  SD: TaxSetting;
  TN: TaxSetting;
  TX: TaxSetting;
  UT: TaxSetting;
  VT: TaxSetting;
  VA: TaxSetting;
  WA: TaxSetting;
  WV: TaxSetting;
  WI: TaxSetting;
  WY: TaxSetting;
}

export interface TaxSetting {
  apply_tax: boolean;
  tax_rate: number;
  tax_name: string;
  reduced_tax_rate: number;
}

export interface EURegion {
  has_sales_above_threshold: boolean;
  tax_all_subregions: boolean;
  tax_threshold: number;
  subregions: EUSubregions;
}

export interface EUSubregions {
  AT: TaxSetting;
  BE: TaxSetting;
  BG: TaxSetting;
  CY: TaxSetting;
  CZ: TaxSetting;
  DE: TaxSetting;
  DK: TaxSetting;
  EE: TaxSetting;
  ES: TaxSetting;
  FI: TaxSetting;
  FR: TaxSetting;
  GR: TaxSetting;
  HR: TaxSetting;
  HU: TaxSetting;
  IE: TaxSetting;
  IT: TaxSetting;
  LT: TaxSetting;
  LU: TaxSetting;
  LV: TaxSetting;
  MT: TaxSetting;
  NL: TaxSetting;
  PT: TaxSetting;
  RO: TaxSetting;
  SE: TaxSetting;
  SI: TaxSetting;
  SK: TaxSetting;
}

export interface AURegion {
  has_sales_above_threshold: boolean;
  tax_all_subregions: boolean;
  tax_threshold: number;
  subregions: AUSubregions;
}

export interface AUSubregions {
  AU: TaxSetting;
}
