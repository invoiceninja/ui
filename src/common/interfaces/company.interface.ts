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
  };
  custom_fields: Record<string, string>;
  enabled_tax_rates: number;
}
