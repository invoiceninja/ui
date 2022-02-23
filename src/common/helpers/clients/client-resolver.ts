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
import { Client } from 'common/interfaces/client';
import { defaultHeaders } from 'common/queries/common/headers';

export class ClientResolver {
  protected declare client: Client;

  public find(id: string): Promise<Client> {
    return new Promise((resolve, reject) => {
      if (id === this.client?.id) {
        return resolve(this.client);
      }

      axios
        .get(endpoint('/api/v1/clients/:id', { id }), {
          headers: defaultHeaders,
        })
        .then((response) => {
          this.client = response.data.data;
          return resolve(this.client);
        })
        .catch((error) => reject(error));
    });
  }
}
