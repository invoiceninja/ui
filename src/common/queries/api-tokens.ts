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
import { useQuery, useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Params } from './common/params.interface';
import { ApiToken } from '$app/common/interfaces/api-token';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { toast } from '$app/common/helpers/toast/toast';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';

export function useApiTokensQuery(params: Params) {
  const { isOwner } = useAdmin();

  return useQuery(
    ['/api/v1/tokens', params],
    () =>
      request(
        'GET',
        endpoint('/api/v1/tokens?per_page=:perPage&page=:currentPage', {
          perPage: params.perPage,
          currentPage: params.currentPage,
        })
      ),
    { staleTime: Infinity, enabled: isOwner }
  );
}

export function useApiTokenQuery(params: { id: string | undefined }) {
  const { isOwner } = useAdmin();

  return useQuery<ApiToken>(
    route('/api/v1/tokens/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/tokens/:id', { id: params.id })).then(
        (response: GenericSingleResourceResponse<ApiToken>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isOwner }
  );
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/tokens/bulk'), {
      action,
      ids: [id],
    }).then(() => {
      toast.success(`${action}d_token`);

      queryClient.invalidateQueries('/api/v1/tokens');

      queryClient.invalidateQueries(route('/api/v1/tokens/:id', { id }));
    });
  };
}

export function useBlankApiTokenQuery() {
  const { isAdmin } = useAdmin();

  return useQuery<ApiToken>(
    '/api/v1/tokens/create',
    () =>
      request('GET', endpoint('/api/v1/tokens/create')).then(
        (response: GenericSingleResourceResponse<ApiToken>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin }
  );
}
