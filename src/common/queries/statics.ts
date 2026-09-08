/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Statics } from '$app/common/interfaces/statics';

export function useStaticsQuery() {
  return useQuery<Statics>({
    queryKey: ['/api/v1/statics'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/statics')).then(
        (response) => response.data
      ),

    enabled: Boolean(localStorage.getItem('X-NINJA-TOKEN')),
    staleTime: Infinity,
  });
}
