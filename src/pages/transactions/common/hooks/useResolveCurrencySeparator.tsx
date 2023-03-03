/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';

export function useResolveCurrencySeparator() {
  const resolveCurrency = useResolveCurrency();

  return (currencyId: string) => {
    const currency = resolveCurrency(currencyId);

    if (currency) {
      return {
        decimalSeparator: currency.decimal_separator,
        precision: currency.precision,
        thousandSeparator: currency.thousand_separator,
      };
    }

    return null;
  };
}
