/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery, useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Params } from './common/params.interface';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ApiWebhook } from '$app/common/interfaces/api-webhook';
import { toast } from '$app/common/helpers/toast/toast';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';

export function useApiWebhooksQuery(params: Params) {
  const { isAdmin } = useAdmin();

  return useQuery(
    ['/api/v1/webhooks', params],
    () =>
      request(
        'GET',
        endpoint('/api/v1/webhooks?per_page=:perPage&page=:currentPage', {
          perPage: params.perPage,
          currentPage: params.currentPage,
        })
      ),
    { enabled: isAdmin }
  );
}

export function useApiWebhookQuery(params: { id: string | undefined }) {
  const { isAdmin } = useAdmin();

  return useQuery<ApiWebhook>(
    route('/api/v1/webhooks/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/webhooks/:id', { id: params.id })).then(
        (response: GenericSingleResourceResponse<ApiWebhook>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin }
  );
}

export function useBlankApiWebhookQuery() {
  const { isAdmin } = useAdmin();

  return useQuery<ApiWebhook>(
    '/api/v1/webhooks/create',
    () =>
      request('GET', endpoint('/api/v1/webhooks/create')).then(
        (response: GenericSingleResourceResponse<ApiWebhook>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin }
  );
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/webhooks/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        toast.success(`${action}d_webhook`);

        queryClient.invalidateQueries('/api/v1/webhooks');

        queryClient.invalidateQueries(route('/api/v1/webhooks/:id', { id }));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.error();
      });
  };
}
