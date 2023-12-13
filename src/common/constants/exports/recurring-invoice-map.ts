/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Record } from './client-map';

export const recurringinvoiceMap: Record[] = [
  {
    trans: 'invoice_number',
    value: 'recurring_invoice.number',
    map: 'recurring_invoice',
  },
  {
    trans: 'amount',
    value: 'recurring_invoice.amount',
    map: 'recurring_invoice',
  },
  {
    trans: 'balance',
    value: 'recurring_invoice.balance',
    map: 'recurring_invoice',
  },
  {
    trans: 'paid_to_date',
    value: 'recurring_invoice.paid_to_date',
    map: 'recurring_invoice',
  },
  {
    trans: 'discount',
    value: 'recurring_invoice.discount',
    map: 'recurring_invoice',
  },
  {
    trans: 'po_number',
    value: 'recurring_invoice.po_number',
    map: 'recurring_invoice',
  },
  { trans: 'date', value: 'recurring_invoice.date', map: 'recurring_invoice' },
  {
    trans: 'due_date',
    value: 'recurring_invoice.due_date',
    map: 'recurring_invoice',
  },
  {
    trans: 'terms',
    value: 'recurring_invoice.terms',
    map: 'recurring_invoice',
  },
  {
    trans: 'footer',
    value: 'recurring_invoice.footer',
    map: 'recurring_invoice',
  },
  {
    trans: 'status',
    value: 'recurring_invoice.status',
    map: 'recurring_invoice',
  },
  {
    trans: 'public_notes',
    value: 'recurring_invoice.public_notes',
    map: 'recurring_invoice',
  },
  {
    trans: 'private_notes',
    value: 'recurring_invoice.private_notes',
    map: 'recurring_invoice',
  },
  {
    trans: 'uses_inclusive_taxes',
    value: 'recurring_invoice.uses_inclusive_taxes',
    map: 'recurring_invoice',
  },
  {
    trans: 'is_amount_discount',
    value: 'recurring_invoice.is_amount_discount',
    map: 'recurring_invoice',
  },
  {
    trans: 'partial',
    value: 'recurring_invoice.partial',
    map: 'recurring_invoice',
  },
  {
    trans: 'partial_due_date',
    value: 'recurring_invoice.partial_due_date',
    map: 'recurring_invoice',
  },
  {
    trans: 'custom_value1',
    value: 'recurring_invoice.custom_value1',
    map: 'recurring_invoice',
  },
  {
    trans: 'custom_value2',
    value: 'recurring_invoice.custom_value2',
    map: 'recurring_invoice',
  },
  {
    trans: 'custom_value3',
    value: 'recurring_invoice.custom_value3',
    map: 'recurring_invoice',
  },
  {
    trans: 'custom_value4',
    value: 'recurring_invoice.custom_value4',
    map: 'recurring_invoice',
  },
  {
    trans: 'surcharge1',
    value: 'recurring_invoice.custom_surcharge1',
    map: 'recurring_invoice',
  },
  {
    trans: 'surcharge2',
    value: 'recurring_invoice.custom_surcharge2',
    map: 'recurring_invoice',
  },
  {
    trans: 'surcharge3',
    value: 'recurring_invoice.custom_surcharge3',
    map: 'recurring_invoice',
  },
  {
    trans: 'surcharge4',
    value: 'recurring_invoice.custom_surcharge4',
    map: 'recurring_invoice',
  },
  {
    trans: 'exchange_rate',
    value: 'recurring_invoice.exchange_rate',
    map: 'recurring_invoice',
  },
  {
    trans: 'tax_amount',
    value: 'recurring_invoice.total_taxes',
    map: 'recurring_invoice',
  },
  {
    trans: 'assigned_user',
    value: 'recurring_invoice.assigned_user_id',
    map: 'recurring_invoice',
  },
  {
    trans: 'user',
    value: 'recurring_invoice.user_id',
    map: 'recurring_invoice',
  },
  {
    trans: 'frequency',
    value: 'recurring_invoice.frequency_id',
    map: 'recurring_invoice',
  },
  {
    trans: 'next_send_date',
    value: 'recurring_invoice.next_send_date',
    map: 'recurring_invoice',
  },
  {
    trans: 'auto_bill',
    value: 'recurring_invoice.auto_bill',
    map: 'recurring_invoice',
  },
  {
    trans: 'auto_bill_enabled',
    value: 'recurring_invoice.auto_bill_enabled',
    map: 'recurring_invoice',
  },

  { trans: 'tax_name1', value: 'recurring_invoice.tax_name1', map: 'recurring_invoice' },
  { trans: 'tax_rate1', value: 'recurring_invoice.tax_rate1', map: 'recurring_invoice' },
  { trans: 'tax_name2', value: 'recurring_invoice.tax_name2', map: 'recurring_invoice' },
  { trans: 'tax_rate2', value: 'recurring_invoice.tax_rate2', map: 'recurring_invoice' },
  { trans: 'tax_name3', value: 'recurring_invoice.tax_name3', map: 'recurring_invoice' },
  { trans: 'tax_rate3', value: 'recurring_invoice.tax_rate3', map: 'recurring_invoice' },

];
