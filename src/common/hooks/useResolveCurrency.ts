/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrencies } from './useCurrencies';

export function useResolveCurrency() {
  const currencies = useCurrencies();

  return (id: string | number) =>
    currencies.find((currency) => currency.id == id);
}
