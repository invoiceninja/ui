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
import { Invoice } from 'common/interfaces/invoice';
import { defaultHeaders } from 'common/queries/common/headers';

export class InvoiceResolver {
  protected declare invoice: Invoice;

  public find(id: string): Promise<Invoice> {
    return new Promise((resolve, reject) => {
      if (id === this.invoice?.id) {
        return resolve(this.invoice);
      }

      fetch(endpoint('/api/v1/invoices/:id', { id }), {
        headers: defaultHeaders(),
      })
        .then((response) => response.json())
        .then((response) => {
          this.invoice = response.data;

          return resolve(this.invoice);
        })
        .catch((error) => reject(error));
    });
  }
}
