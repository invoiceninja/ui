/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Vendor } from '$app/common/interfaces/vendor';

export class VendorResolver {
  protected declare vendor: Vendor;

  public find(id: string): Promise<Vendor> {
    return new Promise((resolve, reject) => {
      if (id === this.vendor?.id) {
        return resolve(this.vendor);
      }

      request('GET', endpoint('/api/v1/vendors/:id', { id }))
        .then((response) => {
          this.vendor = response.data.data;

          return resolve(this.vendor);
        })
        .catch((error) => reject(error));
    });
  }
}

export const vendorResolver = new VendorResolver();

export function useVendorResolver() {
  return vendorResolver;
}
