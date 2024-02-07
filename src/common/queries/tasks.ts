/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, trans } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Task } from '$app/common/interfaces/task';
import { useQuery, useQueryClient } from 'react-query';
import { GenericQueryOptions } from './invoices';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';

interface TaskParams {
  id?: string;
  enabled?: boolean;
}

export function useTaskQuery(params: TaskParams) {
  return useQuery<Task>(
    ['/api/v1/tasks', params.id],
    () =>
      request('GET', endpoint('/api/v1/tasks/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity, enabled: params.enabled ?? true }
  );
}

export function useBlankTaskQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery(
    ['/api/v1/tasks/create'],
    () =>
      request('GET', endpoint('/api/v1/tasks/create')).then(
        (response: GenericSingleResourceResponse<Task>) => response.data.data
      ),
    {
      ...options,
      staleTime: Infinity,
      enabled: hasPermission('create_task') ? options?.enabled ?? true : false,
    }
  );
}

interface TasksParams {
  endpoint?: string;
}

export function useTasksQuery(params: TasksParams) {
  return useQuery<GenericManyResponse<Task>>(
    ['/api/v1/tasks', params],
    () =>
      request(
        'GET',
        endpoint(':endpoint', {
          endpoint: params.endpoint || '/api/v1/tasks',
        })
      ).then((response) => response.data),
    { staleTime: Infinity }
  );
}

export const useBulk = () => {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action: 'archive' | 'restore' | 'delete' | 'start' | 'stop'
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/tasks/bulk'), {
      action,
      ids,
    }).then(() => {
      if (action !== 'start' && action !== 'stop') {
        toast.success(`${action}d_task`);
      }

      if (action === 'start') {
        toast.success(trans('started_tasks', { value: ids.length }));
      }

      if (action === 'stop') {
        toast.success(trans('stopped_tasks', { value: ids.length }));
      }

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);

      $refetch(['tasks']);
    });
  };
};
