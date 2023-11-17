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
  map: string;
}

export const clientMap: Record[] = [
  { trans: 'name', value: 'client.name', map: 'client' },
  { trans: 'number', value: 'client.number', map: 'client' },
  { trans: 'user', value: 'client.user', map: 'client' },
  { trans: 'assigned_user', value: 'client.assigned_user', map: 'client' },
  { trans: 'balance', value: 'client.balance', map: 'client' },
  { trans: 'paid_to_date', value: 'client.paid_to_date', map: 'client' },
  { trans: 'currency', value: 'client.currency_id', map: 'client' },
  { trans: 'website', value: 'client.website', map: 'client' },
  { trans: 'private_notes', value: 'client.private_notes', map: 'client' },
  { trans: 'industry', value: 'client.industry_id', map: 'client' },
  { trans: 'size', value: 'client.size_id', map: 'client' },
  { trans: 'address1', value: 'client.address1', map: 'client' },
  { trans: 'address2', value: 'client.address2', map: 'client' },
  { trans: 'city', value: 'client.city', map: 'client' },
  { trans: 'state', value: 'client.state', map: 'client' },
  { trans: 'postal_code', value: 'client.postal_code', map: 'client' },
  { trans: 'country', value: 'client.country_id', map: 'client' },
  { trans: 'custom_value1', value: 'client.custom_value1', map: 'client' },
  { trans: 'custom_value2', value: 'client.custom_value2', map: 'client' },
  { trans: 'custom_value3', value: 'client.custom_value3', map: 'client' },
  { trans: 'custom_value4', value: 'client.custom_value4', map: 'client' },
  {
    trans: 'shipping_address1',
    value: 'client.shipping_address1',
    map: 'client',
  },
  {
    trans: 'shipping_address2',
    value: 'client.shipping_address2',
    map: 'client',
  },
  { trans: 'shipping_city', value: 'client.shipping_city', map: 'client' },
  { trans: 'shipping_state', value: 'client.shipping_state', map: 'client' },
  {
    trans: 'shipping_postal_code',
    value: 'client.shipping_postal_code',
    map: 'client',
  },
  {
    trans: 'shipping_country',
    value: 'client.shipping_country_id',
    map: 'client',
  },
  { trans: 'payment_terms', value: 'client.payment_terms', map: 'client' },
  { trans: 'vat_number', value: 'client.vat_number', map: 'client' },
  { trans: 'id_number', value: 'client.id_number', map: 'client' },
  { trans: 'public_notes', value: 'client.public_notes', map: 'client' },
  { trans: 'phone', value: 'client.phone', map: 'client' },
  { trans: 'classification', value: 'client.classification', map: 'client' },
  { trans: 'credit_balance', value: 'client.credit_balance', map: 'client' },
  { trans: 'payment_balance', value: 'client.payment_balance', map: 'client' },
  { trans: 'first_name', value: 'contact.first_name', map: 'client' },
  { trans: 'last_name', value: 'contact.last_name', map: 'client' },
  { trans: 'email', value: 'contact.email', map: 'client' },
  { trans: 'phone', value: 'contact.phone', map: 'client' },
  { trans: 'custom_value1', value: 'contact.custom_value1', map: 'client' },
  { trans: 'custom_value2', value: 'contact.custom_value2', map: 'client' },
  { trans: 'custom_value3', value: 'contact.custom_value3', map: 'client' },
  { trans: 'custom_value4', value: 'contact.custom_value4', map: 'client' },
];
