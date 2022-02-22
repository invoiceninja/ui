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
  size_id: string;
  industry_id: string;
  settings: {
    name: string;
    id_number: string;
    vat_number: string;
    website: string;
    email: string;
    phone: string;
  };
  custom_fields: Record<string, string>;
}
