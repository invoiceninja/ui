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
import {
  ProjectBurnupRequest,
  ProjectBurnupResponse,
} from '$app/common/interfaces/project-burnup';
import { useQuery } from 'react-query';

interface QueryOptions {
  enabled?: boolean;
}

export function useProjectBurnupQuery(
  payload: ProjectBurnupRequest,
  options?: QueryOptions
) {
  return useQuery<ProjectBurnupResponse>({
    queryKey: ['/api/v1/charts/project_burnup/:id', payload.project_id],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/project_burnup/:id', { id: payload.project_id }),
        payload
      ).then((response) => response.data),
    staleTime: Infinity,
    enabled: options?.enabled ?? !!payload.project_id,
  });
}
