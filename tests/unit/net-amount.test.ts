/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, test, expect } from 'vitest';
import { calculateNetAmount } from '../../src/common/helpers/invoices/net-amount';

describe('calculateNetAmount', () => {
  test('backs the taxes out of the amount', () => {
    expect(calculateNetAmount({ amount: 392.7, total_taxes: 62.7 })).toBe(330);
  });

  test('untaxed resource keeps its full amount', () => {
    expect(calculateNetAmount({ amount: 1900, total_taxes: 0 })).toBe(1900);
  });

  test('missing total_taxes is treated as no taxes', () => {
    expect(calculateNetAmount({ amount: 1900 })).toBe(1900);
  });

  test('missing amount is treated as zero', () => {
    expect(calculateNetAmount({ total_taxes: 10 })).toBe(-10);
  });

  test('missing resource is zero instead of NaN', () => {
    expect(calculateNetAmount(undefined)).toBe(0);
    expect(calculateNetAmount(null)).toBe(0);
    expect(calculateNetAmount({})).toBe(0);
  });

  test('the footer total equals the sum of the rows it covers', () => {
    const invoices = [
      { amount: 392.7, total_taxes: 62.7 },
      { amount: 357, total_taxes: 57 },
      { amount: 333.2, total_taxes: 53.2 },
      { amount: 273.7, total_taxes: 43.7 },
      { amount: 511.7, total_taxes: 81.7 },
      { amount: 357, total_taxes: 57 },
      { amount: 1900, total_taxes: 0 },
    ];

    const rows = invoices.map(calculateNetAmount);
    const total = rows.reduce((sum, row) => sum + row, 0);

    expect(rows).toEqual([330, 300, 280, 230, 430, 300, 1900]);
    expect(Number(total.toFixed(2))).toBe(3770);
  });
});
