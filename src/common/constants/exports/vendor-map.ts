/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Record {
  trans: string;
  value: string;
}

export const vendorMap: Record[] = [
  { trans: 'name', value: 'vendor.name' },
  { trans: 'address1', value: 'vendor.address1' },
  { trans: 'address2', value: 'vendor.address2' },
  { trans: 'city', value: 'vendor.city' },
  { trans: 'country', value: 'vendor.country_id' },
  { trans: 'custom_value1', value: 'vendor.custom_value1' },
  { trans: 'custom_value2', value: 'vendor.custom_value2' },
  { trans: 'custom_value3', value: 'vendor.custom_value3' },
  { trans: 'custom_value4', value: 'vendor.custom_value4' },
  { trans: 'id_number', value: 'vendor.id_number' },
  { trans: 'number', value: 'vendor.number' },
  { trans: 'phone', value: 'vendor.phone' },
  { trans: 'postal_code', value: 'vendor.postal_code' },
  { trans: 'private_notes', value: 'vendor.private_notes' },
  { trans: 'public_notes', value: 'vendor.public_notes' },
  { trans: 'state', value: 'vendor.state' },
  { trans: 'vat_number', value: 'vendor.vat_number' },
  { trans: 'website', value: 'vendor.website' },
  { trans: 'currency', value: 'vendor.currency' },
  { trans: 'classification', value: 'vendor.classification' },
  { trans: 'first_name', value: 'vendor_contact.first_name' },
  { trans: 'last_name', value: 'vendor_contact.last_name' },
  { trans: 'contact_phone', value: 'vendor_contact.phone' },
  { trans: 'contact_custom_value1', value: 'vendor_contact.custom_value1' },
  { trans: 'contact_custom_value2', value: 'vendor_contact.custom_value2' },
  { trans: 'contact_custom_value3', value: 'vendor_contact.custom_value3' },
  { trans: 'contact_custom_value4', value: 'vendor_contact.custom_value4' },
  { trans: 'email', value: 'vendor_contact.email' },
  { trans: 'status', value: 'vendor.status' },
];
