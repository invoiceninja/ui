/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { roundToPrecision } from './invoices/round';

export function numberFormat(
  value: string | number,
  decimals = 0,
  decimalSeparator = '.',
  thousandSeparator = ','
) {
  const number = typeof value === 'string' ? parseFloat(value) : value;

  const sign = number < 0 ? '-' : '';

  const rounded = roundToPrecision(Math.abs(number), decimals);
  const str = rounded.toFixed(decimals).toString().split('.');
  const int = str[0];
  const decimal = str[1] || '';

  const parts = [];

  for (let i = int.length; i > 0; i -= 3) {
    parts.unshift(int.substring(Math.max(0, i - 3), i));
  }

  const formatted = parts.join(thousandSeparator);

  return sign + formatted + (decimal ? decimalSeparator + decimal : '');
}
