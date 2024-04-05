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

export const purchaseorderMap: Record[] = [
  { trans: 'purchase_order_number', value: 'purchase_order.number', map: 'purchase_order' },
  { trans: 'amount', value: 'purchase_order.amount', map: 'purchase_order' },
  { trans: 'balance', value: 'purchase_order.balance', map: 'purchase_order' },
  { trans: 'paid_to_date', value: 'purchase_order.paid_to_date', map: 'purchase_order' },
  { trans: 'discount', value: 'purchase_order.discount', map: 'purchase_order' },
  { trans: 'po_number', value: 'purchase_order.po_number', map: 'purchase_order' },
  { trans: 'date', value: 'purchase_order.date', map: 'purchase_order' },
  { trans: 'due_date', value: 'purchase_order.due_date', map: 'purchase_order' },
  { trans: 'terms', value: 'purchase_order.terms', map: 'purchase_order' },
  { trans: 'footer', value: 'purchase_order.footer', map: 'purchase_order' },
  { trans: 'status', value: 'purchase_order.status', map: 'purchase_order' },
  { trans: 'public_notes', value: 'purchase_order.public_notes', map: 'purchase_order' },
  { trans: 'private_notes', value: 'purchase_order.private_notes', map: 'purchase_order' },
  {
    trans: 'uses_inclusive_taxes',
    value: 'purchase_order.uses_inclusive_taxes',
    map: 'purchase_order'
   },
  { trans: 'is_amount_discount', value: 'purchase_order.is_amount_discount', map: 'purchase_order' },
  { trans: 'partial', value: 'purchase_order.partial', map: 'purchase_order' },
  { trans: 'partial_due_date', value: 'purchase_order.partial_due_date', map: 'purchase_order' },
  // { trans: 'custom_value1', value: "purchase_order.custom_value1", map: 'purchase_order' },
  // { trans: 'custom_value2', value: "purchase_order.custom_value2", map: 'purchase_order' },
  // { trans: 'custom_value3', value: "purchase_order.custom_value3", map: 'purchase_order' },
  // { trans: 'custom_value4', value: "purchase_order.custom_value4", map: 'purchase_order' },
  { trans: 'surcharge1', value: 'purchase_order.custom_surcharge1', map: 'purchase_order' },
  { trans: 'surcharge2', value: 'purchase_order.custom_surcharge2', map: 'purchase_order' },
  { trans: 'surcharge3', value: 'purchase_order.custom_surcharge3', map: 'purchase_order' },
  { trans: 'surcharge4', value: 'purchase_order.custom_surcharge4', map: 'purchase_order' },
  { trans: 'exchange_rate', value: 'purchase_order.exchange_rate', map: 'purchase_order' },
  { trans: 'tax_amount', value: 'purchase_order.total_taxes', map: 'purchase_order' },
  { trans: 'assigned_user', value: 'purchase_order.assigned_user_id', map: 'purchase_order' },
  { trans: 'user', value: 'purchase_order.user_id', map: 'purchase_order' },
  { trans: 'tax_name1', value: 'purchase_order.tax_name1', map: 'purchase_order' },
  { trans: 'tax_rate1', value: 'purchase_order.tax_rate1', map: 'purchase_order' },
  { trans: 'tax_name2', value: 'purchase_order.tax_name2', map: 'purchase_order' },
  { trans: 'tax_rate2', value: 'purchase_order.tax_rate2', map: 'purchase_order' },
  { trans: 'tax_name3', value: 'purchase_order.tax_name3', map: 'purchase_order' },
  { trans: 'tax_rate3', value: 'purchase_order.tax_rate3', map: 'purchase_order' },
];
