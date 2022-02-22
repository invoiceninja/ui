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
import { numberFormat } from './number-format';

export class Number {
  public static formatValue(value: string | number, currency: Currency) {
    const thousand = currency.thousand_separator;
    const decimal = currency.decimal_separator;
    const precision = currency.precision;

    return numberFormat(value, precision, decimal, thousand);
  }
}
