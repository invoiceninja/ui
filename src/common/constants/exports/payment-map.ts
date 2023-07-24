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

export const paymentMap: Record[] = [
  { trans: 'date', value: 'payment.date' },
  { trans: 'amount', value: 'payment.amount' },
  { trans: 'refunded', value: 'payment.refunded' },
  { trans: 'applied', value: 'payment.applied' },
  { trans: 'transaction_reference', value: 'payment.transaction_reference' },
  { trans: 'currency', value: 'payment.currency' },
  { trans: 'exchange_rate', value: 'payment.exchange_rate' },
  { trans: 'number', value: 'payment.number' },
  { trans: 'method', value: 'payment.method' },
  { trans: 'status', value: 'payment.status' },
  { trans: 'private_notes', value: 'payment.private_notes' },
  { trans: 'custom_value1', value: 'payment.custom_value1' },
  { trans: 'custom_value2', value: 'payment.custom_value2' },
  { trans: 'custom_value3', value: 'payment.custom_value3' },
  { trans: 'custom_value4', value: 'payment.custom_value4' },
  { trans: 'user', value: 'payment.user_id' },
  { trans: 'assigned_user', value: 'payment.assigned_user_id' },
];
