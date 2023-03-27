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
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { useQuery, useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { toast } from '$app/common/helpers/toast/toast';

export function useBlankTaskStatusQuery() {
  const hasPermission = useHasPermission();

  return useQuery<TaskStatus>(
    '/api/v1/task_statuses/create',
    () =>
      request('GET', endpoint('/api/v1/task_statuses/create')).then(
        (response: GenericSingleResourceResponse<TaskStatus>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: hasPermission('create_task') }
  );
}

export function useTaskStatusesQuery() {
  return useQuery<GenericManyResponse<TaskStatus>>(
    route('/api/v1/task_statuses'),
    () =>
      request('GET', endpoint('/api/v1/task_statuses')).then(
        (response) => response.data
      )
  );
}

export function useTaskStatusQuery(params: { id: string | undefined }) {
  return useQuery(
    route('/api/v1/task_statuses/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/task_statuses/:id', { id: params.id })),
    { staleTime: Infinity }
  );
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/task_statuses/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        toast.success(`${action}d_task_status`);

        queryClient.invalidateQueries('/api/v1/task_statuses');

        queryClient.invalidateQueries(
          route('/api/v1/task_statuses/:id', { id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.error();
      });
  };
}
