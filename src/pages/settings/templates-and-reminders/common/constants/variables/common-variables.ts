/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const commonVariables = {
  invoice: [
    '$amount',
    '$balance',
    '$date',
    '$due_date',
    '$footer',
    '$number',
    '$payment_url',
    '$po_number',
    '$terms',
    '$view_url',
    '$assigned_to_user',
    '$created_by_user',
    '$discount',
    '$exchange_rate',
    '$invoices',
    '$payment_button',
    '$payments',
    '$public_notes',
    '$view_button',
  ],
  client: [
    '$client_address1',
    '$client.city',
    '$client.credit_balance',
    '$client.name',
    '$client.postal_code',
    '$client.shipping_address1',
    '$client.shipping_city',
    '$client.shipping_postal_code',
    '$client.state',
    '$client.address2',
    '$client.country',
    '$client.id_number',
    '$client.phone',
    '$client.public_notes',
    '$client.shipping_address2',
    '$client.shipping_country',
    '$client.shipping_state',
    '$client.vat_number',
  ],
  contact: [
    '$contact.email',
    '$contact.first_name',
    '$contact.last_name',
    '$contact.phone',
  ],
  company: [
    '$company.address1',
    '$company.address2',
    '$company.country',
    '$company.email',
    '$company.id_number',
    '$company.name',
    '$company.phone',
    '$company.state',
    '$company.vat_number',
    '$company.website',
  ],
};
