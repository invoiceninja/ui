/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { GenericManyResponse } from 'common/interfaces/generic-many-response';
import { Task } from 'common/interfaces/task';
import { useQuery } from 'react-query';
import { route } from 'common/helpers/route';
import { GenericQueryOptions } from './invoices';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

interface TaskParams {
  id?: string;
  enabled?: boolean;
}

export function useTaskQuery(params: TaskParams) {
  return useQuery<Task>(
    route('/api/v1/tasks/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/tasks/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity, enabled: params.enabled ?? true }
  );
}

export function useBlankTaskQuery(options?: GenericQueryOptions) {
  return useQuery(
    route('/api/v1/tasks/create'),
    () =>
      request('GET', endpoint('/api/v1/tasks/create')).then(
        (response: GenericSingleResourceResponse<Task>) => response.data.data
      ),
    { ...options, staleTime: Infinity }
  );
}

interface TasksParams {
  endpoint?: string;
}

export function useTasksQuery(params: TasksParams) {
  return useQuery<GenericManyResponse<Task>>(
    route(':endpoint', {
      endpoint: params.endpoint || '/api/v1/tasks',
    }),
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
