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

export const creditMap: Record[] = [
  { trans: 'credit_number', value: 'credit.number', map: 'credit' },
  { trans: 'amount', value: 'credit.amount', map: 'credit' },
  { trans: 'balance', value: 'credit.balance', map: 'credit' },
  { trans: 'paid_to_date', value: 'credit.paid_to_date', map: 'credit' },
  { trans: 'discount', value: 'credit.discount', map: 'credit' },
  { trans: 'po_number', value: 'credit.po_number', map: 'credit' },
  { trans: 'date', value: 'credit.date', map: 'credit' },
  { trans: 'due_date', value: 'credit.due_date', map: 'credit' },
  { trans: 'terms', value: 'credit.terms', map: 'credit' },
  { trans: 'footer', value: 'credit.footer', map: 'credit' },
  { trans: 'status', value: 'credit.status', map: 'credit' },
  { trans: 'public_notes', value: 'credit.public_notes', map: 'credit' },
  { trans: 'private_notes', value: 'credit.private_notes', map: 'credit' },
  { trans: 'uses_inclusive_taxes', value: 'credit.uses_inclusive_taxes', map: 'credit' },
  { trans: 'is_amount_discount', value: 'credit.is_amount_discount', map: 'credit' },
  { trans: 'partial', value: 'credit.partial', map: 'credit' },
  { trans: 'partial_due_date', value: 'credit.partial_due_date', map: 'credit' },
  { trans: 'custom_value1', value: 'credit.custom_value1', map: 'credit' },
  { trans: 'custom_value2', value: 'credit.custom_value2', map: 'credit' },
  { trans: 'custom_value3', value: 'credit.custom_value3', map: 'credit' },
  { trans: 'custom_value4', value: 'credit.custom_value4', map: 'credit' },
  { trans: 'surcharge1', value: 'credit.custom_surcharge1', map: 'credit' },
  { trans: 'surcharge2', value: 'credit.custom_surcharge2', map: 'credit' },
  { trans: 'surcharge3', value: 'credit.custom_surcharge3', map: 'credit' },
  { trans: 'surcharge4', value: 'credit.custom_surcharge4', map: 'credit' },
  { trans: 'exchange_rate', value: 'credit.exchange_rate', map: 'credit' },
  { trans: 'tax_amount', value: 'credit.total_taxes', map: 'credit' },
  { trans: 'assigned_user', value: 'credit.assigned_user_id', map: 'credit' },
  { trans: 'user', value: 'credit.user_id', map: 'credit' },
  { trans: 'tax_name1', value: 'credit.tax_name1', map: 'credit' },
  { trans: 'tax_rate1', value: 'credit.tax_rate1', map: 'credit' },
  { trans: 'tax_name2', value: 'credit.tax_name2', map: 'credit' },
  { trans: 'tax_rate2', value: 'credit.tax_rate2', map: 'credit' },
  { trans: 'tax_name3', value: 'credit.tax_name3', map: 'credit' },
  { trans: 'tax_rate3', value: 'credit.tax_rate3', map: 'credit' },
];
