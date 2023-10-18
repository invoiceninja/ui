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

export const invoiceMap: Record[] = [
  { trans: 'invoice_number', value: 'invoice.number' },
  { trans: 'amount', value: 'invoice.amount' },
  { trans: 'balance', value: 'invoice.balance' },
  { trans: 'paid_to_date', value: 'invoice.paid_to_date' },
  { trans: 'discount', value: 'invoice.discount' },
  { trans: 'po_number', value: 'invoice.po_number' },
  { trans: 'date', value: 'invoice.date' },
  { trans: 'due_date', value: 'invoice.due_date' },
  { trans: 'terms', value: 'invoice.terms' },
  { trans: 'footer', value: 'invoice.footer' },
  { trans: 'status', value: 'invoice.status' },
  { trans: 'public_notes', value: 'invoice.public_notes' },
  { trans: 'private_notes', value: 'invoice.private_notes' },
  { trans: 'uses_inclusive_taxes', value: 'invoice.uses_inclusive_taxes' },
  { trans: 'is_amount_discount', value: 'invoice.is_amount_discount' },
  { trans: 'partial', value: 'invoice.partial' },
  { trans: 'partial_due_date', value: 'invoice.partial_due_date' },
  { trans: 'custom_value1', value: 'invoice.custom_value1' },
  { trans: 'custom_value2', value: 'invoice.custom_value2' },
  { trans: 'custom_value3', value: 'invoice.custom_value3' },
  { trans: 'custom_value4', value: 'invoice.custom_value4' },
  { trans: 'surcharge1', value: 'invoice.custom_surcharge1' },
  { trans: 'surcharge2', value: 'invoice.custom_surcharge2' },
  { trans: 'surcharge3', value: 'invoice.custom_surcharge3' },
  { trans: 'surcharge4', value: 'invoice.custom_surcharge4' },
  { trans: 'exchange_rate', value: 'invoice.exchange_rate' },
  { trans: 'tax_amount', value: 'invoice.total_taxes' },
  { trans: 'assigned_user', value: 'invoice.assigned_user_id' },
  { trans: 'user', value: 'invoice.user_id' },
  { trans: 'recurring_invoice', value: 'invoice.recurring_id' },
];
