/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { endpoint, trans } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Task } from '$app/common/interfaces/task';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';
import { GenericQueryOptions } from './invoices';

interface TaskParams {
  id?: string;
  enabled?: boolean;
}

export function useTaskQuery(params: TaskParams) {
  return useQuery({
    queryKey: ['/api/v1/tasks', params.id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/tasks/:id?include=status', { id: params.id })
      ).then((response) => response.data.data),

    staleTime: Infinity,
    enabled: params.enabled ?? Boolean(params.id),
  });
}

export function useBlankTaskQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: ['/api/v1/tasks/create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/tasks/create')).then(
        (response: GenericSingleResourceResponse<Task>) => response.data.data
      ),

    ...options,
    staleTime: Infinity,

    enabled: hasPermission('create_task') ? (options?.enabled ?? true) : false,
  });
}

interface TasksParams {
  endpoint?: string;
}

export function useTasksQuery(params: TasksParams) {
  return useQuery<GenericManyResponse<Task>>({
    queryKey: ['/api/v1/tasks', params],

    queryFn: () =>
      request(
        'GET',
        endpoint(':endpoint', {
          endpoint: params.endpoint || '/api/v1/tasks',
        })
      ).then((response) => response.data),

    staleTime: Infinity,
  });
}

interface Details {
  column?: string;
  new_value?: string | number | boolean;
}

export const useBulk = () => {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action: 'archive' | 'restore' | 'delete' | 'start' | 'stop' | 'bulk_update',
    details?: Details
  ) => {
    const { column, new_value } = details || {};

    toast.processing();

    return request('POST', endpoint('/api/v1/tasks/bulk'), {
      action,
      ids,
      ...(column && { column }),
      ...(action === 'bulk_update' && { new_value }),
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
        queryClient.invalidateQueries({
          queryKey: [invalidateQueryValue],
        });

      $refetch(['tasks']);
    });
  };
};
