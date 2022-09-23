/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { route } from 'common/helpers/route';

export function useUsersQuery() {
  return useQuery('/api/v1/users', () =>
    request('GET', endpoint('/api/v1/users'))
  );
}

export function useUserQuery(params: { id: string | undefined }) {
  return useQuery(
    route('/api/v1/users/:id', params),
    () =>
      request(
        'GET',
        endpoint('/api/v1/users/:id?include=company_user', params)
      ),
    { staleTime: Infinity }
  );
}

export function useBlankUserQuery() {
  return useQuery(
    route('/api/v1/users/create'),
    () => request('GET', endpoint('/api/v1/users/create')),
    { staleTime: Infinity }
  );
}
