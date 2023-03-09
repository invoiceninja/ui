/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

interface BlankQueryParams {
  refetchOnWindowFocus?: boolean;
}

export function useBlankClientQuery(params: BlankQueryParams) {
  const hasPermission = useHasPermission();

  return useQuery(
    '/api/v1/clients/create',
    () =>
      request('GET', endpoint('/api/v1/clients/create')).then(
        (response) => response.data.data
      ),
    {
      refetchOnWindowFocus: Boolean(params.refetchOnWindowFocus),
      staleTime: Infinity,
      enabled: hasPermission('create_client'),
    }
  );
}

interface Props {
  enabled?: boolean;
}

export function useClientsQuery(props: Props) {
  return useQuery(
    ['/api/v1/clients?filter_deleted_clients=true'],
    () =>
      request('GET', endpoint('/api/v1/clients')).then(
        (response) => response.data.data
      ),
    { enabled: props.enabled ?? true, staleTime: Infinity }
  );
}

export function useClientQuery(
  params: { id: string | undefined },
  options: Record<string, any> = {}
) {
  return useQuery(
    route('/api/v1/clients/:id', { id: params.id }),
    () => request('GET', endpoint('/api/v1/clients/:id', { id: params.id })),
    { ...options, staleTime: Infinity }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'delete'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/clients/bulk'), {
    action,
    ids: Array.from(id),
  });
}
