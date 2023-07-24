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

export const recurringinvoiceMap: Record[] = [
  { trans: 'invoice_number', value: 'recurring_invoice.number' },
  { trans: 'amount', value: 'recurring_invoice.amount' },
  { trans: 'balance', value: 'recurring_invoice.balance' },
  { trans: 'paid_to_date', value: 'recurring_invoice.paid_to_date' },
  { trans: 'discount', value: 'recurring_invoice.discount' },
  { trans: 'po_number', value: 'recurring_invoice.po_number' },
  { trans: 'date', value: 'recurring_invoice.date' },
  { trans: 'due_date', value: 'recurring_invoice.due_date' },
  { trans: 'terms', value: 'recurring_invoice.terms' },
  { trans: 'footer', value: 'recurring_invoice.footer' },
  { trans: 'status', value: 'recurring_invoice.status' },
  { trans: 'public_notes', value: 'recurring_invoice.public_notes' },
  { trans: 'private_notes', value: 'recurring_invoice.private_notes' },
  {
    trans: 'uses_inclusive_taxes',
    value: 'recurring_invoice.uses_inclusive_taxes',
  },
  {
    trans: 'is_amount_discount',
    value: 'recurring_invoice.is_amount_discount',
  },
  { trans: 'partial', value: 'recurring_invoice.partial' },
  { trans: 'partial_due_date', value: 'recurring_invoice.partial_due_date' },
  { trans: 'custom_value1', value: 'recurring_invoice.custom_value1' },
  { trans: 'custom_value2', value: 'recurring_invoice.custom_value2' },
  { trans: 'custom_value3', value: 'recurring_invoice.custom_value3' },
  { trans: 'custom_value4', value: 'recurring_invoice.custom_value4' },
  { trans: 'surcharge1', value: 'recurring_invoice.custom_surcharge1' },
  { trans: 'surcharge2', value: 'recurring_invoice.custom_surcharge2' },
  { trans: 'surcharge3', value: 'recurring_invoice.custom_surcharge3' },
  { trans: 'surcharge4', value: 'recurring_invoice.custom_surcharge4' },
  { trans: 'exchange_rate', value: 'recurring_invoice.exchange_rate' },
  { trans: 'tax_amount', value: 'recurring_invoice.total_taxes' },
  { trans: 'assigned_user', value: 'recurring_invoice.assigned_user_id' },
  { trans: 'user', value: 'recurring_invoice.user_id' },
  { trans: 'frequency', value: 'recurring_invoice.frequency_id' },
  { trans: 'next_send_date', value: 'recurring_invoice.next_send_date' },
];
