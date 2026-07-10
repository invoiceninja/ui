/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Schedule } from '$app/common/interfaces/schedule';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';

export function useBlankScheduleQuery() {
  const { isAdmin, isOwner } = useAdmin();

  return useQuery({
    queryKey: ['/api/v1/task_schedulers', 'create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/task_schedulers/create')).then(
        (response: GenericSingleResourceResponse<Schedule>) =>
          response.data.data
      ),

    staleTime: Infinity,
    enabled: isAdmin || isOwner,
  });
}

interface ScheduleParams {
  id: string | undefined;
}

export function useScheduleQuery(params: ScheduleParams) {
  const { isAdmin, isOwner } = useAdmin();

  return useQuery({
    queryKey: ['/api/v1/task_schedulers', params.id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/task_schedulers/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<Schedule>) =>
          response.data.data
      ),

    staleTime: Infinity,
    enabled: isAdmin || isOwner,
  });
}

export function useBulkAction() {
  return (ids: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/task_schedulers/bulk'), {
      action,
      ids,
    }).then(() => {
      toast.success(`${action}d_schedule`);

      $refetch(['task_schedulers']);
    });
  };
}
