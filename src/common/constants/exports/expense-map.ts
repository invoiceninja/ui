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
  { trans: 'amount', value: 'expense.amount' },
  { trans: 'category', value: 'expense.category' },
  { trans: 'custom_value1', value: 'expense.custom_value1' },
  { trans: 'custom_value2', value: 'expense.custom_value2' },
  { trans: 'custom_value3', value: 'expense.custom_value3' },
  { trans: 'custom_value4', value: 'expense.custom_value4' },
  { trans: 'currency', value: 'expense.currency_id' },
  { trans: 'date', value: 'expense.date' },
  { trans: 'exchange_rate', value: 'expense.exchange_rate' },
  { trans: 'converted_amount', value: 'expense.foreign_amount' },
  { trans: 'invoice_currency_id', value: 'expense.invoice_currency_id' },
  { trans: 'payment_date', value: 'expense.payment_date' },
  { trans: 'number', value: 'expense.number' },
  { trans: 'payment_type_id', value: 'expense.payment_type_id' },
  { trans: 'private_notes', value: 'expense.private_notes' },
  { trans: 'project', value: 'expense.project_id' },
  { trans: 'public_notes', value: 'expense.public_notes' },
  { trans: 'tax_amount1', value: 'expense.tax_amount1' },
  { trans: 'tax_amount2', value: 'expense.tax_amount2' },
  { trans: 'tax_amount3', value: 'expense.tax_amount3' },
  { trans: 'tax_name1', value: 'expense.tax_name1' },
  { trans: 'tax_name2', value: 'expense.tax_name2' },
  { trans: 'tax_name3', value: 'expense.tax_name3' },
  { trans: 'tax_rate1', value: 'expense.tax_rate1' },
  { trans: 'tax_rate2', value: 'expense.tax_rate2' },
  { trans: 'tax_rate3', value: 'expense.tax_rate3' },
  { trans: 'transaction_reference', value: 'expense.transaction_reference' },
  { trans: 'invoice', value: 'expense.invoice_id' },
  { trans: 'user', value: 'expense.user' },
  { trans: 'assigned_user', value: 'expense.assigned_user' },
];
