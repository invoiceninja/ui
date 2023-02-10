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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useQuery, useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';
import { Params } from './common/params.interface';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { ApiWebhook } from 'common/interfaces/api-webhook';
import { toast } from 'common/helpers/toast/toast';

export function useApiWebhooksQuery(params: Params) {
  return useQuery(['/api/v1/webhooks', params], () =>
    request(
      'GET',
      endpoint('/api/v1/webhooks?per_page=:perPage&page=:currentPage', {
        perPage: params.perPage,
        currentPage: params.currentPage,
      })
    )
  );
}

export function useApiWebhookQuery(params: { id: string | undefined }) {
  return useQuery<ApiWebhook>(
    route('/api/v1/webhooks/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/webhooks/:id', { id: params.id })).then(
        (response: GenericSingleResourceResponse<ApiWebhook>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useBlankApiWebhookQuery() {
  return useQuery<ApiWebhook>(
    '/api/v1/webhooks/create',
    () =>
      request('GET', endpoint('/api/v1/webhooks/create')).then(
        (response: GenericSingleResourceResponse<ApiWebhook>) =>
          response.data.data
      ),
    { staleTime: Infinity }
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
