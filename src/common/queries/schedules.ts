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
import { useQuery } from 'react-query';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { route } from 'common/helpers/route';
import { Schedule } from 'common/interfaces/schedule';
import { useHasPermission } from 'common/hooks/permissions/useHasPermission';

export function useBlankScheduleQuery() {
  const hasPermission = useHasPermission();

  return useQuery<Schedule>(
    '/api/v1/task_schedulers/create',
    () =>
      request('GET', endpoint('/api/v1/task_schedulers/create')).then(
        (response: GenericSingleResourceResponse<Schedule>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: hasPermission('create_task_schedule') }
  );
}

interface ScheduleParams {
  id: string | undefined;
}

export function useScheduleQuery(params: ScheduleParams) {
  const hasPermission = useHasPermission();

  return useQuery<Schedule>(
    route('/api/v1/task_schedulers/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/task_schedulers/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<Schedule>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: hasPermission('edit_task_schedule') }
  );
}
