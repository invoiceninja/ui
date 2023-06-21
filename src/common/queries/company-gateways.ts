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
import { useQuery } from 'react-query';
import { route } from '$app/common/helpers/route';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';

export function useCompanyGatewaysQuery() {
  const { isAdmin } = useAdmin();

  return useQuery(
    '/api/v1/company_gateways?sort=id|desc',
    () => request('GET', endpoint('/api/v1/company_gateways?sort=id|desc')),
    { staleTime: Infinity, enabled: isAdmin }
  );
}

interface Params {
  id: string | undefined;
  queryParams?: string;
  enabled?: boolean;
}

export function useCompanyGatewayQuery(params: Params) {
  const { isAdmin } = useAdmin();

  return useQuery(
    [
      route('/api/v1/company_gateways/:id', {
        id: params.id,
      }),
      params.queryParams,
    ],
    () =>
      request(
        'GET',
        endpoint(`/api/v1/company_gateways/:id?${params.queryParams || ''}`, {
          id: params.id,
        })
      ),
    { staleTime: Infinity, enabled: (params.enabled ?? true) && isAdmin }
  );
}

export function useBlankCompanyGatewayQuery() {
  const { isAdmin } = useAdmin();

  return useQuery(
    route('/api/v1/company_gateways/create'),
    () => request('GET', endpoint('/api/v1/company_gateways/create')),
    { staleTime: Infinity, enabled: isAdmin }
  );
}
