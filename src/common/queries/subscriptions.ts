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
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Subscription } from '$app/common/interfaces/subscription';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';

export function useBlankSubscriptionQuery() {
  const { isAdmin, isOwner } = useAdmin();

  return useQuery<Subscription>(
    ['/api/v1/subscriptions', 'create'],
    () =>
      request('GET', endpoint('/api/v1/subscriptions/create')).then(
        (response: GenericSingleResourceResponse<Subscription>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin || isOwner }
  );
}

export function useSubscriptionQuery(params: { id: string | undefined }) {
  const { isAdmin, isOwner } = useAdmin();

  return useQuery<Subscription>(
    ['/api/v1/subscriptions', params.id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/subscriptions/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<Subscription>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin || isOwner }
  );
}

export function useBulkAction() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return async (ids: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    return request('POST', endpoint('/api/v1/subscriptions/bulk'), {
      action,
      ids,
    }).then(() => {
      toast.success(`${action}d_subscription`);

      $refetch(['subscriptions']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
}
