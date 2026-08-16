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
import { InclusiveTax } from '../../src/common/helpers/invoices/inclusive-tax';

describe('InclusiveTax.backout', () => {
  test('two equal inclusive taxes are additive, not compounded', () => {
    const result = InclusiveTax.backout(1000, [10, 10, 0]);

    expect(result.net).toBe(833.34);
    expect(result.tax).toBe(166.66);
    expect(result.components).toEqual([83.33, 83.33, 0]);
  });

  test('single inclusive tax', () => {
    const result = InclusiveTax.backout(1000, [10, 0, 0]);

    expect(result.net).toBe(909.09);
    expect(result.tax).toBe(90.91);
    expect(result.components).toEqual([90.91, 0, 0]);
  });

  test('three equal inclusive taxes', () => {
    const result = InclusiveTax.backout(1000, [10, 10, 10]);

    expect(result.net).toBe(769.24);
    expect(result.tax).toBe(230.76);
    expect(result.components).toEqual([76.92, 76.92, 76.92]);
  });

  test('two different inclusive taxes', () => {
    const result = InclusiveTax.backout(1000, [8, 5, 0]);

    expect(result.net).toBe(884.95);
    expect(result.tax).toBe(115.05);
    expect(result.components).toEqual([70.8, 44.25, 0]);
  });

  test('no taxes returns the amount as net', () => {
    const result = InclusiveTax.backout(1000, [0, 0, 0]);

    expect(result.net).toBe(1000);
    expect(result.tax).toBe(0);
    expect(result.components).toEqual([0, 0, 0]);
  });

  test('zero amount', () => {
    const result = InclusiveTax.backout(0, [10, 10, 0]);

    expect(result.net).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.components).toEqual([0, 0, 0]);
  });

  test('negative amount mirrors the positive back-out', () => {
    const result = InclusiveTax.backout(-1000, [10, 10, 0]);

    expect(result.net).toBe(-833.34);
    expect(result.tax).toBe(-166.66);
    expect(result.components).toEqual([-83.33, -83.33, 0]);
  });

  test('negative combined rate is guarded against division by zero', () => {
    const result = InclusiveTax.backout(1000, [-100, 0, 0]);

    expect(result.net).toBe(1000);
    expect(result.tax).toBe(0);
    expect(result.components).toEqual([0, 0, 0]);
  });

  test('zero-decimal currency precision', () => {
    const result = InclusiveTax.backout(1000, [10, 10, 0], 0);

    expect(result.net).toBe(834);
    expect(result.tax).toBe(166);
    expect(result.components).toEqual([83, 83, 0]);
  });

  test('net plus tax always reconciles to the gross amount', () => {
    const scenarios: Array<[number, number[]]> = [
      [1000, [10, 10, 0]],
      [1000, [10, 10, 10]],
      [1000, [8, 5, 0]],
      [1234.56, [7, 13, 0]],
      [99.99, [15, 0, 0]],
      [500, [21, 6, 3]],
    ];

    scenarios.forEach(([amount, rates]) => {
      const { net, tax } = InclusiveTax.backout(amount, rates);

      expect(Number((net + tax).toFixed(2))).toBe(amount);
    });
  });
});
