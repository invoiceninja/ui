/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Company {
  id: string;
  size_id: string;
  industry_id: string;
  settings: {
    name: string;
    id_number: string;
    vat_number: string;
    website: string;
    email: string;
    phone: string;
    date_format_id: string;
    company_logo: string;
    pdf_variables: {
      product_columns: string[];
      total_columns: string[];
    };
    tax_name1: string;
    tax_name2: string;
    tax_name3: string;
    currency_id: string;
    invoice_design_id: string;
    email_template_custom1: string;
    email_template_custom2: string;
    email_template_custom3: string;
    email_subject_custom1: string;
    email_subject_custom2: string;
    email_subject_custom3: string;
    auto_bill_date: 'on_send_date' | 'on_due_date';
    use_credits_payment: 'always' | 'option' | 'off';
    client_portal_allow_over_payment: boolean;
    client_portal_allow_under_payment: boolean;
    client_portal_under_payment_minimum: string;
  };
  custom_fields: Record<string, string>;
  enabled_tax_rates: number;
  enabled_item_tax_rates: number;
  enable_product_discount: boolean;
}
