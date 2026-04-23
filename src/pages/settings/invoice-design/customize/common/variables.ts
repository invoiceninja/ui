/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const variables = {
  invoice: [
    '$amount',
    '$assigned_to_user',
    '$balance',
    '$created_by_user',
    '$date',
    '$discount',
    '$due_date',
    '$exchange_rate',
    '$footer',
    '$invoice',
    '$invoices',
    '$number',
    '$payment_button',
    '$payment_url',
    '$payments',
    '$po_number',
    '$public_notes',
    '$terms',
    '$view_button',
    '$view_url',
  ],
  client: [
    '$client.address1',
    '$client.address2',
    '$client.city',
    '$client.country',
    '$client.credit_balance',
    '$client.id_number',
    '$client.name',
    '$client.phone',
    '$client.postal_code',
    '$client.public_notes',
    '$client.shipping_address1',
    '$client.shipping_address2',
    '$client.shipping_city',
    '$client.shipping_country',
    '$client.shipping_postal_code',
    '$client.shipping_state',
    '$client.state',
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
  docu_company: [
    '{{ company.name }}',
    '{{ company.address1 }}',
    '{{ company.address2 }}',
    '{{ company.city }}',
    '{{ company.state }}',
    '{{ company.postal_code }}',
  ],
  docu_document: [
    '{{ document.description }}',
    '{{ document.link }}',
  ],
  docu_sender: [
    '{{ sender.first_name }}',
    '{{ sender.last_name }}',
    '{{ sender.phone_number }}',
    '{{ sender.email }}',
    '{{ sender.name }}',
  ],
  docu_user: [
    '{{ user.first_name }}',
    '{{ user.last_name }}',
    '{{ user.phone_number }}',
    '{{ user.email }}',
    '{{ user.name }}',
  ],
  docu_contact: [
    '{{ contact.first_name }}',
    '{{ contact.last_name }}',
    '{{ contact.phone }}',
    '{{ contact.email }}',
    '{{ contact.name }}',
  ]

};
