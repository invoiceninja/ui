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

export const invoiceMap: Record[] = [
  { trans: 'invoice_number', value: 'invoice.number', map: 'invoice' },
  { trans: 'amount', value: 'invoice.amount', map: 'invoice' },
  { trans: 'balance', value: 'invoice.balance', map: 'invoice' },
  { trans: 'paid_to_date', value: 'invoice.paid_to_date', map: 'invoice' },
  { trans: 'discount', value: 'invoice.discount', map: 'invoice' },
  { trans: 'po_number', value: 'invoice.po_number', map: 'invoice' },
  { trans: 'date', value: 'invoice.date', map: 'invoice' },
  { trans: 'due_date', value: 'invoice.due_date', map: 'invoice' },
  { trans: 'terms', value: 'invoice.terms', map: 'invoice' },
  { trans: 'footer', value: 'invoice.footer', map: 'invoice' },
  { trans: 'status', value: 'invoice.status', map: 'invoice' },
  { trans: 'public_notes', value: 'invoice.public_notes', map: 'invoice' },
  { trans: 'private_notes', value: 'invoice.private_notes', map: 'invoice' },
  {
    trans: 'uses_inclusive_taxes',
    value: 'invoice.uses_inclusive_taxes',
    map: 'invoice',
  },
  {
    trans: 'is_amount_discount',
    value: 'invoice.is_amount_discount',
    map: 'invoice',
  },
  { trans: 'partial', value: 'invoice.partial', map: 'invoice' },
  {
    trans: 'partial_due_date',
    value: 'invoice.partial_due_date',
    map: 'invoice',
  },
  { trans: 'custom_value1', value: 'invoice.custom_value1', map: 'invoice' },
  { trans: 'custom_value2', value: 'invoice.custom_value2', map: 'invoice' },
  { trans: 'custom_value3', value: 'invoice.custom_value3', map: 'invoice' },
  { trans: 'custom_value4', value: 'invoice.custom_value4', map: 'invoice' },
  { trans: 'surcharge1', value: 'invoice.custom_surcharge1', map: 'invoice' },
  { trans: 'surcharge2', value: 'invoice.custom_surcharge2', map: 'invoice' },
  { trans: 'surcharge3', value: 'invoice.custom_surcharge3', map: 'invoice' },
  { trans: 'surcharge4', value: 'invoice.custom_surcharge4', map: 'invoice' },
  { trans: 'exchange_rate', value: 'invoice.exchange_rate', map: 'invoice' },
  { trans: 'tax_amount', value: 'invoice.total_taxes', map: 'invoice' },
  { trans: 'assigned_user', value: 'invoice.assigned_user_id', map: 'invoice' },
  { trans: 'user', value: 'invoice.user_id', map: 'invoice' },
  { trans: 'recurring_invoice', value: 'invoice.recurring_id', map: 'invoice' },
  { trans: 'auto_bill', value: 'invoice.auto_bill_enabled', map: 'invoice' },
  { trans: 'tax_name1', value: 'invoice.tax_name1', map: 'invoice' },
  { trans: 'tax_rate1', value: 'invoice.tax_rate1', map: 'invoice' },
  { trans: 'tax_name2', value: 'invoice.tax_name2', map: 'invoice' },
  { trans: 'tax_rate2', value: 'invoice.tax_rate2', map: 'invoice' },
  { trans: 'tax_name3', value: 'invoice.tax_name3', map: 'invoice' },
  { trans: 'tax_rate3', value: 'invoice.tax_rate3', map: 'invoice' },

];
