/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Location {
  id: string;
  user_id: string;
  vendor_id: string;
  client_id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postal_code: string;
  country_id: string;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  is_deleted: boolean;
  is_shipping_location: boolean;
  updated_at: number;
  archived_at: number;
  created_at: number;
}
