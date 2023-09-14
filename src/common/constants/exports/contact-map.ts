/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Record {
  trans: string;
  value: string;
}

export const contactMap: Record[] = [
  { trans: 'first_name', value: 'contact.first_name' },
  { trans: 'last_name', value: 'contact.last_name' },
  { trans: 'email', value: 'contact.email' },
  { trans: 'phone', value: 'contact.phone' },
  { trans: 'custom_value1', value: 'contact.custom_value1' },
  { trans: 'custom_value2', value: 'contact.custom_value2' },
  { trans: 'custom_value3', value: 'contact.custom_value3' },
  { trans: 'custom_value4', value: 'contact.custom_value4' },
];
