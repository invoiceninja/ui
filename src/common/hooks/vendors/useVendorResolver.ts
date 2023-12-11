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
import { useQueryClient } from 'react-query';

export function useVendorResolver() {
  const queryClient = useQueryClient();

  const find = (id: string) => {
    return queryClient.fetchQuery<Vendor>(
      ['/api/v1/vendors', id],
      () =>
        request('GET', endpoint('/api/v1/vendors/:id', { id })).then(
          (response) => response.data.data
        ),
      { staleTime: Infinity }
    );
  };

  return { find };
}
