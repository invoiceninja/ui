/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from 'react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import {
  ProjectAnalyticsRequest,
  ProjectAnalyticsResponse,
} from '$app/common/interfaces/project-analytics';

interface QueryOptions {
  enabled?: boolean;
}

export function useProjectAnalyticsQuery(
  payload: ProjectAnalyticsRequest,
  options?: QueryOptions
) {
  return useQuery<ProjectAnalyticsResponse>({
    queryKey: [
      '/api/v1/charts/project_analytics',
      payload.project_id,
      payload.include_drafts,
    ],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/project_analytics/:id', {
          id: payload.project_id,
        }),
        payload,
        { skipIntercept: true }
      ).then((response) => response.data),
    staleTime: Infinity,
    retry: false,
    enabled: options?.enabled ?? Boolean(payload.project_id),
  });
}
