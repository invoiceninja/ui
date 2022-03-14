/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { Currency } from 'common/interfaces/currency';
import { Statics } from 'common/interfaces/statics';
import { defaultHeaders } from 'common/queries/common/headers';
import { QueryClient } from 'react-query';

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
        axios.get(endpoint('/api/v1/statics'), { headers: defaultHeaders })
      )
      .then((data) =>
        data.data.currencies.find((currency: Currency) => currency.id === id)
      );
  }
}
