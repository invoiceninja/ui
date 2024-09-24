/**
* Invoice Ninja (https://invoiceninja.com).
*
* @link https://github.com/invoiceninja/invoiceninja source repository
*
* @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
*
* @license https://www.elastic.co/licensing/elastic-license
*/

import currencies from '../../helpers/data/currencies';
import { Number } from './../../../src/common/helpers/number';

describe('Test Access Currency Object', () => {
  test('access', () => {
    const usd_currency = currencies.filter(
      (currency) => currency.code == 'USD'
    )[0];
    expect(usd_currency.id).toEqual('1');
    expect(usd_currency.precision).toEqual(2);
  });
});

describe('Test Number Formatting', () => {
  it('USD', async () => {
    const currency = currencies.filter((currency) => currency.code == 'USD')[0];

    // Positive values
    expect(Number.formatValue(10, currency)).toEqual('10.00');
    expect(Number.formatValue(100, currency)).toEqual('100.00');
    expect(Number.formatValue(100.52, currency)).toEqual('100.52');
    expect(Number.formatValue(1000.25, currency)).toEqual('1,000.25');
    expect(Number.formatValue(10_000.25, currency)).toEqual('10,000.25');
    expect(Number.formatValue(100_000.25, currency)).toEqual('100,000.25');
    expect(Number.formatValue(1_000_000.25, currency)).toEqual('1,000,000.25');
    expect(Number.formatValue(10_000_000.25, currency)).toEqual('10,000,000.25');
    expect(Number.formatValue(100_000_000.25, currency)).toEqual('100,000,000.25');
    expect(Number.formatValue(100_000_000_000.25, currency)).toEqual('100,000,000,000.25');
    expect(Number.formatValue(100_000_000_000_000.25, currency)).toEqual('100,000,000,000,000.25');

    // Negative values
    expect(Number.formatValue(-10, currency)).toEqual('-10.00');
    expect(Number.formatValue(-100, currency)).toEqual('-100.00');
    expect(Number.formatValue(-100.52, currency)).toEqual('-100.52');
    expect(Number.formatValue(-1000.25, currency)).toEqual('-1,000.25');
    expect(Number.formatValue(-10_000.25, currency)).toEqual('-10,000.25');
    expect(Number.formatValue(-100_000.25, currency)).toEqual('-100,000.25');
    expect(Number.formatValue(-1_000_000.25, currency)).toEqual('-1,000,000.25');
    expect(Number.formatValue(-10_000_000.25, currency)).toEqual('-10,000,000.25');
    expect(Number.formatValue(-100_000_000.25, currency)).toEqual('-100,000,000.25');
    expect(Number.formatValue(-100_000_000_000.25, currency)).toEqual('-100,000,000,000.25');
    expect(Number.formatValue(-100_000_000_000_000.25, currency)).toEqual('-100,000,000,000,000.25');
  });

  it('EUR', async () => {
    const currency = currencies.filter((currency) => currency.code == 'EUR')[0];

    // Positive values
    expect(Number.formatValue(10, currency)).toEqual('10,00');
    expect(Number.formatValue(100, currency)).toEqual('100,00');
    expect(Number.formatValue(100.52, currency)).toEqual('100,52');
    expect(Number.formatValue(1000.25, currency)).toEqual('1.000,25');
    expect(Number.formatValue(10_000.25, currency)).toEqual('10.000,25');
    expect(Number.formatValue(100_000.25, currency)).toEqual('100.000,25');
    expect(Number.formatValue(1_000_000.25, currency)).toEqual('1.000.000,25');
    expect(Number.formatValue(10_000_000.25, currency)).toEqual('10.000.000,25');
    expect(Number.formatValue(100_000_000.25, currency)).toEqual('100.000.000,25');
    expect(Number.formatValue(100_000_000_000.25, currency)).toEqual('100.000.000.000,25');
    expect(Number.formatValue(100_000_000_000_000.25, currency)).toEqual('100.000.000.000.000,25');

    // Negative values
    expect(Number.formatValue(-10, currency)).toEqual('-10,00');
    expect(Number.formatValue(-100, currency)).toEqual('-100,00');
    expect(Number.formatValue(-100.52, currency)).toEqual('-100,52');
    expect(Number.formatValue(-1000.25, currency)).toEqual('-1.000,25');
    expect(Number.formatValue(-10_000.25, currency)).toEqual('-10.000,25');
    expect(Number.formatValue(-100_000.25, currency)).toEqual('-100.000,25');
    expect(Number.formatValue(-1_000_000.25, currency)).toEqual('-1.000.000,25');
    expect(Number.formatValue(-10_000_000.25, currency)).toEqual('-10.000.000,25');
    expect(Number.formatValue(-100_000_000.25, currency)).toEqual('-100.000.000,25');
    expect(Number.formatValue(-100_000_000_000.25, currency)).toEqual('-100.000.000.000,25');
    expect(Number.formatValue(-100_000_000_000_000.25, currency)).toEqual('-100.000.000.000.000,25');
  });

  it('GBP', async () => {
    const currency = currencies.filter((currency) => currency.code == 'GBP')[0];

    // Positive values
    expect(Number.formatValue(10, currency)).toEqual('10.00');
    expect(Number.formatValue(100, currency)).toEqual('100.00');
    expect(Number.formatValue(100.52, currency)).toEqual('100.52');
    expect(Number.formatValue(1000.25, currency)).toEqual('1,000.25');
    expect(Number.formatValue(10_000.25, currency)).toEqual('10,000.25');
    expect(Number.formatValue(100_000.25, currency)).toEqual('100,000.25');
    expect(Number.formatValue(1_000_000.25, currency)).toEqual('1,000,000.25');
    expect(Number.formatValue(10_000_000.25, currency)).toEqual('10,000,000.25');
    expect(Number.formatValue(100_000_000.25, currency)).toEqual('100,000,000.25');
    expect(Number.formatValue(100_000_000_000.25, currency)).toEqual('100,000,000,000.25');
    expect(Number.formatValue(100_000_000_000_000.25, currency)).toEqual('100,000,000,000,000.25');

    // Negative values
    expect(Number.formatValue(-10, currency)).toEqual('-10.00');
    expect(Number.formatValue(-100, currency)).toEqual('-100.00');
    expect(Number.formatValue(-100.52, currency)).toEqual('-100.52');
    expect(Number.formatValue(-1000.25, currency)).toEqual('-1,000.25');
    expect(Number.formatValue(-10_000.25, currency)).toEqual('-10,000.25');
    expect(Number.formatValue(-100_000.25, currency)).toEqual('-100,000.25');
    expect(Number.formatValue(-1_000_000.25, currency)).toEqual('-1,000,000.25');
    expect(Number.formatValue(-10_000_000.25, currency)).toEqual('-10,000,000.25');
    expect(Number.formatValue(-100_000_000.25, currency)).toEqual('-100,000,000.25');
    expect(Number.formatValue(-100_000_000_000.25, currency)).toEqual('-100,000,000,000.25');
    expect(Number.formatValue(-100_000_000_000_000.25, currency)).toEqual('-100,000,000,000,000.25');
  });

  it('JPY', async () => {
    const currency = currencies.filter((currency) => currency.code == 'JPY')[0];

    // Positive values
    expect(Number.formatValue(10, currency)).toEqual('10');
    expect(Number.formatValue(100, currency)).toEqual('100');
    expect(Number.formatValue(100.45, currency)).toEqual('100');
    expect(Number.formatValue(100.52, currency)).toEqual('101');
    expect(Number.formatValue(1000.25, currency)).toEqual('1,000');
    expect(Number.formatValue(10_000.25, currency)).toEqual('10,000');
    expect(Number.formatValue(100_000.25, currency)).toEqual('100,000');
    expect(Number.formatValue(1_000_000.25, currency)).toEqual('1,000,000');
    expect(Number.formatValue(10_000_000.25, currency)).toEqual('10,000,000');
    expect(Number.formatValue(100_000_000.25, currency)).toEqual('100,000,000');
    expect(Number.formatValue(100_000_000_000.25, currency)).toEqual('100,000,000,000');
    expect(Number.formatValue(100_000_000_000_000.25, currency)).toEqual('100,000,000,000,000');

    // Negative values
    expect(Number.formatValue(-10, currency)).toEqual('-10');
    expect(Number.formatValue(-100, currency)).toEqual('-100');
    expect(Number.formatValue(-100.45, currency)).toEqual('-100');
    expect(Number.formatValue(-100.52, currency)).toEqual('-101');
    expect(Number.formatValue(-1000.25, currency)).toEqual('-1,000');
    expect(Number.formatValue(-10_000.25, currency)).toEqual('-10,000');
    expect(Number.formatValue(-100_000.25, currency)).toEqual('-100,000');
    expect(Number.formatValue(-1_000_000.25, currency)).toEqual('-1,000,000');
    expect(Number.formatValue(-10_000_000.25, currency)).toEqual('-10,000,000');
    expect(Number.formatValue(-100_000_000.25, currency)).toEqual('-100,000,000');
    expect(Number.formatValue(-100_000_000_000.25, currency)).toEqual('-100,000,000,000');
    expect(Number.formatValue(-100_000_000_000_000.25, currency)).toEqual('-100,000,000,000,000');

    // Decimal values (testing non-standard usage)
    expect(Number.formatValue(100.00, currency)).toEqual('100');
    expect(Number.formatValue(-100.00, currency)).toEqual('-100');
    expect(Number.formatValue(1000.01, currency)).toEqual('1,000');
    expect(Number.formatValue(-1000.99, currency)).toEqual('-1,001');
  });
});
