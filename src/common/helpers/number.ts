/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Currency } from 'common/interfaces/currency';

export class Number {
  public static numberFormat(value: string | number, currency: Currency) {
    const number = typeof value === 'string' ? parseFloat(value) : value;

    const str = number
      .toFixed(currency.precision || 0)
      .toString()
      .split('.');

    const parts = [];

    for (let i = str[0].length; i > 0; i -= 3) {
      parts.unshift(str[0].substring(Math.max(0, i - 3), i));
    }

    str[0] = parts.join(currency.thousand_separator || ',');

    return str.join(currency.decimal_separator || '.');
  }
}
