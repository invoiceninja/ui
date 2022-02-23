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

export class CurrencyResolver {
  protected declare statics: Statics;

  public find(id: string): Promise<Currency | undefined> {
    return new Promise((resolve, reject) => {
      if (this.statics) {
        const currency = this.statics.currencies.find(
          (currency) => currency.id === id
        );

        return resolve(currency as unknown as Currency);
      }

      axios
        .get(endpoint('/api/v1/statics'), { headers: defaultHeaders })
        .then((response) => {
          this.statics = response.data;

          this.find(id);
        })
        .catch((errors) => reject(errors));
    });
  }
}
