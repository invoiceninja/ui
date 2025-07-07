/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from 'react-query';
import { Params } from '../common/params.interface';
import { request } from '$app/common/helpers/request';
import { docuNinjaEndpoint } from '$app/common/helpers';

export function useUsersQuery(params: Params) {
  return useQuery(
    ['/api/users/docuninja', params],
    () =>
      request(
        'GET',
        docuNinjaEndpoint(
          '/api/users?per_page=:per_page&page=:page&filter=:filter',
          {
            per_page: params.perPage ?? '100',
            page: params.currentPage ?? '1',
            filter: params.filter ?? '',
          }
        ),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ),
    { staleTime: Infinity, enabled: true }
  );
}

interface UserParams {
  id: string | undefined;
}

export function useUserQuery(params: UserParams) {
  return useQuery(
    ['/api/users/docuninja', params],
    () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/users/:id', {
          id: params.id,
        }),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ),
    { staleTime: Infinity, enabled: Boolean(params.id) }
  );
}
