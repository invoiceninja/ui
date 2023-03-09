/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { Credit } from '$app/common/interfaces/credit';
import { defaultHeaders } from '$app/common/queries/common/headers';

export class CreditResolver {
  protected declare credit: Credit;

  public find(id: string): Promise<Credit> {
    return new Promise((resolve, reject) => {
      if (id === this.credit?.id) {
        return resolve(this.credit);
      }

      fetch(endpoint('/api/v1/credits/:id', { id }), {
        headers: defaultHeaders(),
      })
        .then((response) => response.json())
        .then((response) => {
          this.credit = response.data;

          return resolve(this.credit);
        })
        .catch((error) => reject(error));
    });
  }
}
