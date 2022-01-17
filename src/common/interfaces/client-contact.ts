/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface ClientContact {
  archived_at: number;
  contact_key: string;
  created_at: number;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  email: string;
  first_name: string;
  id: string;
  is_locked: boolean;
  is_primary: boolean;
  last_login: number;
  last_name: string;
  link: string;
  password: string;
  phone: string;
  send_email: boolean;
  updated_at: number;
}
