/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { Currency } from 'common/interfaces/currency';
import { Statics } from 'common/interfaces/statics';
import { QueryClient } from 'react-query';
import { request } from '../request';

export class CurrencyResolver {
  protected declare statics: Statics;
  protected queryClient: QueryClient;

  constructor() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
        },
      },
    });
  }

  public find(id: string): Promise<Currency | undefined> {
    return this.queryClient
      .fetchQuery(endpoint('/api/v1/statics'), () =>
        request('GET', endpoint('/api/v1/statics'))
      )
      .then((data) =>
        data.data.currencies.find((currency: Currency) => currency.id === id)
      );
  }
}

const currencyResolver = new CurrencyResolver();

export function useCurrencyResolver() {
  return currencyResolver;
}
