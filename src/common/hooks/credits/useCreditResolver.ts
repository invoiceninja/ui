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
import { Invoice } from '$app/common/interfaces/invoice';
import { useQueryClient } from 'react-query';

export function useCreditResolver() {
  const queryClient = useQueryClient();

  const find = (id: string) => {
    return queryClient.fetchQuery<Invoice>(
      ['/api/v1/credits', id],
      () =>
        request(
          'GET',
          endpoint('/api/v1/credits/:id?include=client', { id })
        ).then((response) => response.data.data),
      { staleTime: Infinity }
    );
  };

  return { find };
}
