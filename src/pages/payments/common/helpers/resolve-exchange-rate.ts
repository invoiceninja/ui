/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
export function getExchangeRate(
  fromCurrencyId: string,
  toCurrencyId: string,
  statics: any
) {
  if (fromCurrencyId == null || toCurrencyId == null) {
    return 1;
  }
  const fromCurrency = statics?.currencies.find(
    (data: any) => data.id === fromCurrencyId
  );
  const toCurrency = statics?.currencies.find(
    (data: any) => data.id === toCurrencyId
  );
  const baseCurrency = statics?.currencies.find((data: any) => data.id === '1');

  if (fromCurrency == baseCurrency) {
    return toCurrency.exchange_rate;
  }

  if (toCurrency == baseCurrency) {
    return 1 / (fromCurrency?.exchange_rate ?? 1);
  }

  return toCurrency.exchange_rate * (1 / fromCurrency.exchange_rate);
}
