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

export const purchaseorderMap: Record[] = [
  { trans: 'purchase_order_number', value: 'purchase_order.number' },
  { trans: 'amount', value: 'purchase_order.amount' },
  { trans: 'balance', value: 'purchase_order.balance' },
  { trans: 'paid_to_date', value: 'purchase_order.paid_to_date' },
  { trans: 'discount', value: 'purchase_order.discount' },
  { trans: 'po_number', value: 'purchase_order.po_number' },
  { trans: 'date', value: 'purchase_order.date' },
  { trans: 'due_date', value: 'purchase_order.due_date' },
  { trans: 'terms', value: 'purchase_order.terms' },
  { trans: 'footer', value: 'purchase_order.footer' },
  { trans: 'status', value: 'purchase_order.status' },
  { trans: 'public_notes', value: 'purchase_order.public_notes' },
  { trans: 'private_notes', value: 'purchase_order.private_notes' },
  {
    trans: 'uses_inclusive_taxes',
    value: 'purchase_order.uses_inclusive_taxes',
  },
  { trans: 'is_amount_discount', value: 'purchase_order.is_amount_discount' },
  { trans: 'partial', value: 'purchase_order.partial' },
  { trans: 'partial_due_date', value: 'purchase_order.partial_due_date' },
  // { trans: 'custom_value1', value: "purchase_order.custom_value1" },
  // { trans: 'custom_value2', value: "purchase_order.custom_value2" },
  // { trans: 'custom_value3', value: "purchase_order.custom_value3" },
  // { trans: 'custom_value4', value: "purchase_order.custom_value4" },
  { trans: 'surcharge1', value: 'purchase_order.custom_surcharge1' },
  { trans: 'surcharge2', value: 'purchase_order.custom_surcharge2' },
  { trans: 'surcharge3', value: 'purchase_order.custom_surcharge3' },
  { trans: 'surcharge4', value: 'purchase_order.custom_surcharge4' },
  { trans: 'exchange_rate', value: 'purchase_order.exchange_rate' },
  { trans: 'tax_amount', value: 'purchase_order.total_taxes' },
  { trans: 'assigned_user', value: 'purchase_order.assigned_user_id' },
  { trans: 'user', value: 'purchase_order.user_id' },
];
