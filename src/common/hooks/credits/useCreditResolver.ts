/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from '@tanstack/react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';

export function useCreditResolver() {
  const queryClient = useQueryClient();

  const find = (id: string) => {
    return queryClient.fetchQuery({
      queryKey: ['/api/v1/credits', id],

      queryFn: () =>
        request(
          'GET',
          endpoint('/api/v1/credits/:id?include=client&sort=id|asc', { id })
        ).then((response) => response.data.data),

      staleTime: Infinity,
    });
  };

  return { find };
}
