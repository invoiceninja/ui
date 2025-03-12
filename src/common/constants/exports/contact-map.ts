/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Record } from "./client-map";

export const contactMap: Record[] = [
  { trans: 'first_name', value: 'contact.first_name', map: 'contact' },
  { trans: 'last_name', value: 'contact.last_name', map: 'contact' },
  { trans: 'email', value: 'contact.email', map: 'contact' },
  { trans: 'phone', value: 'contact.phone', map: 'contact' },
  { trans: 'custom_value1', value: 'contact.custom_value1', map: 'contact' },
  { trans: 'custom_value2', value: 'contact.custom_value2', map: 'contact' },
  { trans: 'custom_value3', value: 'contact.custom_value3', map: 'contact' },
  { trans: 'custom_value4', value: 'contact.custom_value4', map: 'contact' },
  { trans: 'name', value: 'client.name', map: 'contact' },
  { trans: 'user', value: 'client.user', map: 'contact' },
  { trans: 'assigned_user', value: 'client.assigned_user', map: 'contact' },
  { trans: 'balance', value: 'client.balance', map: 'contact' },
  { trans: 'paid_to_date', value: 'client.paid_to_date', map: 'contact' },
  { trans: 'currency', value: 'client.currency_id', map: 'contact' },
  { trans: 'website', value: 'client.website', map: 'contact' },
  { trans: 'private_notes', value: 'client.private_notes', map: 'contact' },
  { trans: 'industry', value: 'client.industry_id', map: 'contact' },
  { trans: 'size', value: 'client.size_id', map: 'contact' },
  { trans: 'address1', value: 'client.address1', map: 'contact' },
  { trans: 'address2', value: 'client.address2', map: 'contact' },
  { trans: 'city', value: 'client.city', map: 'contact' },
  { trans: 'state', value: 'client.state', map: 'contact' },
  { trans: 'postal_code', value: 'client.postal_code', map: 'contact' },
  { trans: 'country', value: 'client.country_id', map: 'contact' },
  { trans: 'custom_value1', value: 'client.custom_value1', map: 'contact' },
  { trans: 'custom_value2', value: 'client.custom_value2', map: 'contact' },
  { trans: 'custom_value3', value: 'client.custom_value3', map: 'contact' },
  { trans: 'custom_value4', value: 'client.custom_value4', map: 'contact' },
  { trans: 'shipping_address1', value: 'client.shipping_address1', map: 'contact' },
  { trans: 'shipping_address2', value: 'client.shipping_address2', map: 'contact' },
  { trans: 'shipping_city', value: 'client.shipping_city', map: 'contact' },
  { trans: 'shipping_state', value: 'client.shipping_state', map: 'contact' },
  { trans: 'shipping_postal_code', value: 'client.shipping_postal_code', map: 'contact' },
  { trans: 'shipping_country', value: 'client.shipping_country_id', map: 'contact' },
  { trans: 'payment_terms', value: 'client.payment_terms', map: 'contact' },
  { trans: 'vat_number', value: 'client.vat_number', map: 'contact' },
  { trans: 'id_number', value: 'client.id_number', map: 'contact' },
  { trans: 'public_notes', value: 'client.public_notes', map: 'contact' },
  { trans: 'phone', value: 'client.phone', map: 'contact' },
];
