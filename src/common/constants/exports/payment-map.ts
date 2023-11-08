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

export const paymentMap: Record[] = [
  { trans: 'date', value: 'payment.date', map: 'payment' },
  { trans: 'amount', value: 'payment.amount', map: 'payment' },
  { trans: 'refunded', value: 'payment.refunded', map: 'payment' },
  { trans: 'applied', value: 'payment.applied', map: 'payment' },
  { trans: 'transaction_reference', value: 'payment.transaction_reference', map: 'payment' },
  { trans: 'currency', value: 'payment.currency', map: 'payment' },
  { trans: 'exchange_rate', value: 'payment.exchange_rate', map: 'payment' },
  { trans: 'number', value: 'payment.number', map: 'payment' },
  { trans: 'method', value: 'payment.method', map: 'payment' },
  { trans: 'status', value: 'payment.status', map: 'payment' },
  { trans: 'private_notes', value: 'payment.private_notes', map: 'payment' },
  { trans: 'custom_value1', value: 'payment.custom_value1', map: 'payment' },
  { trans: 'custom_value2', value: 'payment.custom_value2', map: 'payment' },
  { trans: 'custom_value3', value: 'payment.custom_value3', map: 'payment' },
  { trans: 'custom_value4', value: 'payment.custom_value4', map: 'payment' },
  { trans: 'user', value: 'payment.user_id', map: 'payment' },
  { trans: 'assigned_user', value: 'payment.assigned_user_id', map: 'payment' },
];
