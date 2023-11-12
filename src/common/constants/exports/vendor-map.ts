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

export const vendorMap: Record[] = [
  { trans: 'name', value: 'vendor.name', map: 'vendor' },
  { trans: 'address1', value: 'vendor.address1', map: 'vendor' },
  { trans: 'address2', value: 'vendor.address2', map: 'vendor' },
  { trans: 'city', value: 'vendor.city', map: 'vendor' },
  { trans: 'country', value: 'vendor.country_id', map: 'vendor' },
  { trans: 'custom_value1', value: 'vendor.custom_value1', map: 'vendor' },
  { trans: 'custom_value2', value: 'vendor.custom_value2', map: 'vendor' },
  { trans: 'custom_value3', value: 'vendor.custom_value3', map: 'vendor' },
  { trans: 'custom_value4', value: 'vendor.custom_value4', map: 'vendor' },
  { trans: 'id_number', value: 'vendor.id_number', map: 'vendor' },
  { trans: 'number', value: 'vendor.number', map: 'vendor' },
  { trans: 'phone', value: 'vendor.phone', map: 'vendor' },
  { trans: 'postal_code', value: 'vendor.postal_code', map: 'vendor' },
  { trans: 'private_notes', value: 'vendor.private_notes', map: 'vendor' },
  { trans: 'public_notes', value: 'vendor.public_notes', map: 'vendor' },
  { trans: 'state', value: 'vendor.state', map: 'vendor' },
  { trans: 'vat_number', value: 'vendor.vat_number', map: 'vendor' },
  { trans: 'website', value: 'vendor.website', map: 'vendor' },
  { trans: 'currency', value: 'vendor.currency', map: 'vendor' },
  { trans: 'first_name', value: 'vendor_contact.first_name', map: 'vendor' },
  { trans: 'last_name', value: 'vendor_contact.last_name', map: 'vendor' },
  { trans: 'contact_phone', value: 'vendor_contact.phone', map: 'vendor' },
  { trans: 'contact_custom_value1', value: 'vendor_contact.custom_value1', map: 'vendor' },
  { trans: 'contact_custom_value2', value: 'vendor_contact.custom_value2', map: 'vendor' },
  { trans: 'contact_custom_value3', value: 'vendor_contact.custom_value3', map: 'vendor' },
  { trans: 'contact_custom_value4', value: 'vendor_contact.custom_value4', map: 'vendor' },
  { trans: 'email', value: 'vendor_contact.email', map: 'vendor' },
  { trans: 'status', value: 'vendor.status', map: 'vendor' },
];
