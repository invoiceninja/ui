/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from '$app/common/queries/statics';

export function useCurrencyResolver() {
  const statics = useStaticsQuery();

  const find = (id: string) => {
    if (statics) {
      return Promise.resolve(
        statics.data?.currencies.find((currency) => currency.id === id)
      );
    }

    return Promise.resolve(undefined);
  };

  return { find };
}

export function useResolveCurrency() {
  const statics = useStaticsQuery();

  return (id: string) => {
    if (statics) {
      return statics.data?.currencies.find((currency) => currency.id === id);
    }

    return undefined;
  };
}
