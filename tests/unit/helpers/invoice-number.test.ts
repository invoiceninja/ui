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

    let formatValue = Number.formatValue(10, currency);
    expect(formatValue).toEqual('10.00');

    formatValue = Number.formatValue(100, currency);
    expect(formatValue).toEqual('100.00');

    formatValue = Number.formatValue(100.52, currency);
    expect(formatValue).toEqual('100.52');

    formatValue = Number.formatValue(1000.25, currency);
    expect(formatValue).toEqual('1,000.25');
  });

  it('EUR', async () => {
    const currency = currencies.filter((currency) => currency.code == 'EUR')[0];

    let formatValue = Number.formatValue(10, currency);
    expect(formatValue).toEqual('10,00');

    formatValue = Number.formatValue(100, currency);
    expect(formatValue).toEqual('100,00');

    formatValue = Number.formatValue(100.52, currency);
    expect(formatValue).toEqual('100,52');

    formatValue = Number.formatValue(1000.25, currency);
    expect(formatValue).toEqual('1.000,25');
  });

  it('GBP', async () => {
    const currency = currencies.filter((currency) => currency.code == 'GBP')[0];

    let formatValue = Number.formatValue(10, currency);
    expect(formatValue).toEqual('10.00');

    formatValue = Number.formatValue(100, currency);
    expect(formatValue).toEqual('100.00');

    formatValue = Number.formatValue(100.52, currency);
    expect(formatValue).toEqual('100.52');

    formatValue = Number.formatValue(1000.25, currency);
    expect(formatValue).toEqual('1,000.25');
  });

  it('JPY', async () => {
    const currency = currencies.filter((currency) => currency.code == 'JPY')[0];

    let formatValue = Number.formatValue(10, currency);
    expect(formatValue).toEqual('10');

    formatValue = Number.formatValue(100, currency);
    expect(formatValue).toEqual('100');

    formatValue = Number.formatValue(100.45, currency);
    expect(formatValue).toEqual('100');

    formatValue = Number.formatValue(100.52, currency);
    expect(formatValue).toEqual('101');

    formatValue = Number.formatValue(1000.25, currency);
    expect(formatValue).toEqual('1,000');
  });
});
