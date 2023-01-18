/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { GenericManyResponse } from 'common/interfaces/generic-many-response';
import { TaskStatus } from 'common/interfaces/task-status';
import { useQuery } from 'react-query';
import { route } from 'common/helpers/route';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

export function useBlankTaskStatusQuery() {
  return useQuery<TaskStatus>(
    '/api/v1/task_statuses/create',
    () =>
      request('GET', endpoint('/api/v1/task_statuses/create')).then(
        (response: GenericSingleResourceResponse<TaskStatus>) =>
          response.data.data
      ),
    { staleTime: Infinity }
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

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/task_statuses/bulk'), {
    action,
    ids: id,
  });
}
