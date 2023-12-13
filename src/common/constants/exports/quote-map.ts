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

export const quoteMap: Record[] = [
  { trans: 'quote_number', value: 'quote.number', map: 'quote' },
  { trans: 'amount', value: 'quote.amount', map: 'quote' },
  { trans: 'balance', value: 'quote.balance', map: 'quote' },
  { trans: 'paid_to_date', value: 'quote.paid_to_date', map: 'quote' },
  { trans: 'discount', value: 'invoice.discount', map: 'quote' },
  { trans: 'po_number', value: 'quote.po_number', map: 'quote' },
  { trans: 'date', value: 'quote.date', map: 'quote' },
  { trans: 'due_date', value: 'quote.due_date', map: 'quote' },
  { trans: 'terms', value: 'quote.terms', map: 'quote' },
  { trans: 'footer', value: 'quote.footer', map: 'quote' },
  { trans: 'status', value: 'quote.status', map: 'quote' },
  { trans: 'public_notes', value: 'quote.public_notes', map: 'quote' },
  { trans: 'private_notes', value: 'quote.private_notes', map: 'quote' },
  { trans: 'uses_inclusive_taxes', value: 'quote.uses_inclusive_taxes', map: 'quote' },
  { trans: 'is_amount_discount', value: 'quote.is_amount_discount', map: 'quote' },
  { trans: 'partial', value: 'quote.partial', map: 'quote' },
  { trans: 'partial_due_date', value: 'quote.partial_due_date', map: 'quote' },
  { trans: 'custom_value1', value: 'quote.custom_value1', map: 'quote' },
  { trans: 'custom_value2', value: 'quote.custom_value2', map: 'quote' },
  { trans: 'custom_value3', value: 'quote.custom_value3', map: 'quote' },
  { trans: 'custom_value4', value: 'quote.custom_value4', map: 'quote' },
  { trans: 'surcharge1', value: 'quote.custom_surcharge1', map: 'quote' },
  { trans: 'surcharge2', value: 'quote.custom_surcharge2', map: 'quote' },
  { trans: 'surcharge3', value: 'quote.custom_surcharge3', map: 'quote' },
  { trans: 'surcharge4', value: 'quote.custom_surcharge4', map: 'quote' },
  { trans: 'exchange_rate', value: 'quote.exchange_rate', map: 'quote' },
  { trans: 'tax_amount', value: 'quote.total_taxes', map: 'quote' },
  { trans: 'assigned_user', value: 'quote.assigned_user_id', map: 'quote' },
  { trans: 'user', value: 'quote.user_id', map: 'quote' },
  { trans: 'tax_name1', value: 'quote.tax_name1', map: 'quote' },
  { trans: 'tax_rate1', value: 'quote.tax_rate1', map: 'quote' },
  { trans: 'tax_name2', value: 'quote.tax_name2', map: 'quote' },
  { trans: 'tax_rate2', value: 'quote.tax_rate2', map: 'quote' },
  { trans: 'tax_name3', value: 'quote.tax_name3', map: 'quote' },
  { trans: 'tax_rate3', value: 'quote.tax_rate3', map: 'quote' },
];
