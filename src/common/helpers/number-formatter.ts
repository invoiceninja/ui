/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { numberFormat } from './number-format';

export class NumberFormatter {
  public static formatValue(value: string | number, precision: number) {
    return numberFormat(value, precision, '.', '');
  }
}
