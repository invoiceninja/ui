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
import { toast } from '$app/common/helpers/toast/toast';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { $refetch } from '../hooks/useRefetch';
import { GenericQueryOptions } from './invoices';

export function useBlankTaskStatusQuery(options?: GenericQueryOptions) {
  const { isAdmin } = useAdmin();

  return useQuery({
    queryKey: ['/api/v1/task_statuses', 'create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/task_statuses/create')).then(
        (response: GenericSingleResourceResponse<TaskStatus>) =>
          response.data.data
      ),

    staleTime: Infinity,
    enabled: isAdmin ? (options?.enabled ?? true) : false,
  });
}

interface Params {
  status?: string;
}

export function useTaskStatusesQuery(params?: Params) {
  return useQuery<GenericManyResponse<TaskStatus>>({
    queryKey: ['/api/v1/task_statuses', params],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/task_statuses?status=:status', {
          status: params?.status || 'all',
        })
      ).then((response) => response.data),

    staleTime: Infinity,
  });
}

export function useTaskStatusQuery(params: { id: string | undefined }) {
  return useQuery({
    queryKey: ['/api/v1/task_statuses', params.id],

    queryFn: () =>
      request('GET', endpoint('/api/v1/task_statuses/:id', { id: params.id })),

    staleTime: Infinity,
  });
}

export function useBulkAction() {
  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/task_statuses/bulk'), {
      action,
      ids: [id],
    }).then(() => {
      toast.success(`${action}d_task_status`);

      $refetch(['task_statuses']);
    });
  };
}
