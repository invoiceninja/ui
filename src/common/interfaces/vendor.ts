import { VendorContact } from './vendor-contact';

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
export interface Vendor {
  name: string;
  number: string;
  user_id: string;
  id_number: string;
  vat_number: string;
  website: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postal_code: string;
  country_id: string;
  currency_id: string;
  private_notes: string;
  public_notes: string;
  custom_value1?: string;
  custom_value2?: string;
  custom_value3?: string;
  custom_value4?: string;
  contacts: VendorContact[];
}
