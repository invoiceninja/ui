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
import { Schedule } from '$app/common/interfaces/schedule';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';

export function useBlankScheduleQuery() {
  const { isAdmin, isOwner } = useAdmin();

  return useQuery<Schedule>(
    ['/api/v1/task_schedulers', 'create'],
    () =>
      request('GET', endpoint('/api/v1/task_schedulers/create')).then(
        (response: GenericSingleResourceResponse<Schedule>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin || isOwner }
  );
}

interface ScheduleParams {
  id: string | undefined;
}

export function useScheduleQuery(params: ScheduleParams) {
  const { isAdmin, isOwner } = useAdmin();

  return useQuery<Schedule>(
    ['/api/v1/task_schedulers', params.id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/task_schedulers/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<Schedule>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin || isOwner }
  );
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
