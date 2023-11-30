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
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ApiWebhook } from '$app/common/interfaces/api-webhook';
import { toast } from '$app/common/helpers/toast/toast';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '../hooks/useRefetch';

export function useApiWebhookQuery(params: { id: string | undefined }) {
  const { isAdmin } = useAdmin();

  return useQuery<ApiWebhook>(
    ['/api/v1/webhooks', params.id],
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
  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/webhooks/bulk'), {
      action,
      ids: [id],
    }).then(() => {
      toast.success(`${action}d_webhook`);

      $refetch(['webhooks']);
    });
  };
}
