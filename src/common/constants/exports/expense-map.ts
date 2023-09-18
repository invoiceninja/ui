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

export const expenseMap: Record[] = [
  { trans: 'amount', value: 'expense.amount', map: 'expense' },
  { trans: 'category', value: 'expense.category', map: 'expense' },
  { trans: 'custom_value1', value: 'expense.custom_value1', map: 'expense' },
  { trans: 'custom_value2', value: 'expense.custom_value2', map: 'expense' },
  { trans: 'custom_value3', value: 'expense.custom_value3', map: 'expense' },
  { trans: 'custom_value4', value: 'expense.custom_value4', map: 'expense' },
  { trans: 'currency', value: 'expense.currency_id', map: 'expense' },
  { trans: 'date', value: 'expense.date', map: 'expense' },
  { trans: 'exchange_rate', value: 'expense.exchange_rate', map: 'expense' },
  { trans: 'converted_amount', value: 'expense.foreign_amount', map: 'expense' },
  { trans: 'invoice_currency_id', value: 'expense.invoice_currency_id', map: 'expense' },
  { trans: 'payment_date', value: 'expense.payment_date', map: 'expense' },
  { trans: 'number', value: 'expense.number', map: 'expense' },
  { trans: 'payment_type_id', value: 'expense.payment_type_id', map: 'expense' },
  { trans: 'private_notes', value: 'expense.private_notes', map: 'expense' },
  { trans: 'project', value: 'expense.project_id', map: 'expense' },
  { trans: 'public_notes', value: 'expense.public_notes', map: 'expense' },
  { trans: 'tax_amount1', value: 'expense.tax_amount1', map: 'expense' },
  { trans: 'tax_amount2', value: 'expense.tax_amount2', map: 'expense' },
  { trans: 'tax_amount3', value: 'expense.tax_amount3', map: 'expense' },
  { trans: 'tax_name1', value: 'expense.tax_name1', map: 'expense' },
  { trans: 'tax_name2', value: 'expense.tax_name2', map: 'expense' },
  { trans: 'tax_name3', value: 'expense.tax_name3', map: 'expense' },
  { trans: 'tax_rate1', value: 'expense.tax_rate1', map: 'expense' },
  { trans: 'tax_rate2', value: 'expense.tax_rate2', map: 'expense' },
  { trans: 'tax_rate3', value: 'expense.tax_rate3', map: 'expense' },
  { trans: 'transaction_reference', value: 'expense.transaction_reference', map: 'expense' },
  { trans: 'invoice', value: 'expense.invoice_id', map: 'expense' },
  { trans: 'user', value: 'expense.user', map: 'expense' },
  { trans: 'assigned_user', value: 'expense.assigned_user', map: 'expense' },
];
