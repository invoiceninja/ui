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
import { GenericQueryOptions } from './invoices';
import { useAdmin } from 'common/hooks/permissions/useHasPermission';

export function useUsersQuery() {
  return useQuery('/api/v1/users', () =>
    request('GET', endpoint('/api/v1/users'))
  );
}

interface UserQueryProps extends GenericQueryOptions {
  id: string;
}

export function useUserQuery(options: UserQueryProps) {
  return useQuery(
    route('/api/v1/users/:id', { id: options.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/users/:id?include=company_user', { id: options.id })
      ),
    { enabled: options.enabled, staleTime: Infinity }
  );
}

export function useBlankUserQuery() {
  const { isAdmin } = useAdmin();

  return useQuery(
    route('/api/v1/users/create'),
    () => request('GET', endpoint('/api/v1/users/create')),
    { staleTime: Infinity, enabled: isAdmin }
  );
}
