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

export const clientMap: Record[] = [
  { trans: 'name', value: 'client.name' },
  { trans: 'number', value: 'client.number' },
  { trans: 'user', value: 'client.user' },
  { trans: 'assigned_user', value: 'client.assigned_user' },
  { trans: 'balance', value: 'client.balance' },
  { trans: 'paid_to_date', value: 'client.paid_to_date' },
  { trans: 'currency', value: 'client.currency_id' },
  { trans: 'website', value: 'client.website' },
  { trans: 'private_notes', value: 'client.private_notes' },
  { trans: 'industry', value: 'client.industry_id' },
  { trans: 'size', value: 'client.size_id' },
  { trans: 'address1', value: 'client.address1' },
  { trans: 'address2', value: 'client.address2' },
  { trans: 'city', value: 'client.city' },
  { trans: 'state', value: 'client.state' },
  { trans: 'postal_code', value: 'client.postal_code' },
  { trans: 'country', value: 'client.country_id' },
  { trans: 'custom_value1', value: 'client.custom_value1' },
  { trans: 'custom_value2', value: 'client.custom_value2' },
  { trans: 'custom_value3', value: 'client.custom_value3' },
  { trans: 'custom_value4', value: 'client.custom_value4' },
  { trans: 'shipping_address1', value: 'client.shipping_address1' },
  { trans: 'shipping_address2', value: 'client.shipping_address2' },
  { trans: 'shipping_city', value: 'client.shipping_city' },
  { trans: 'shipping_state', value: 'client.shipping_state' },
  { trans: 'shipping_postal_code', value: 'client.shipping_postal_code' },
  { trans: 'shipping_country', value: 'client.shipping_country_id' },
  { trans: 'payment_terms', value: 'client.payment_terms' },
  { trans: 'vat_number', value: 'client.vat_number' },
  { trans: 'id_number', value: 'client.id_number' },
  { trans: 'public_notes', value: 'client.public_notes' },
  { trans: 'phone', value: 'client.phone' },
  { trans: 'classification', value: 'client.classification' },
  { trans: 'credit_balance', value: 'client.credit_balance' },
  { trans: 'payment_balance', value: 'client.payment_balance' },
  { trans: 'first_name', value: 'contact.first_name' },
  { trans: 'last_name', value: 'contact.last_name' },
  { trans: 'email', value: 'contact.email' },
  { trans: 'phone', value: 'contact.phone' },
  { trans: 'custom_value1', value: 'contact.custom_value1' },
  { trans: 'custom_value2', value: 'contact.custom_value2' },
  { trans: 'custom_value3', value: 'contact.custom_value3' },
  { trans: 'custom_value4', value: 'contact.custom_value4' },
];
