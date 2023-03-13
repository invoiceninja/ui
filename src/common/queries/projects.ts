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
import { Project } from '$app/common/interfaces/project';
import { useQuery } from 'react-query';
import { route } from '$app/common/helpers/route';
import { GenericQueryOptions } from './invoices';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export function useBlankProjectQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery<Project>(
    '/api/v1/projects/create',
    () =>
      request('GET', endpoint('/api/v1/projects/create')).then(
        (response: GenericSingleResourceResponse<Project>) => response.data.data
      ),
    {
      ...options,
      staleTime: Infinity,
      enabled: hasPermission('create_project'),
    }
  );
}

export function useProjectQuery(params: { id: string | undefined }) {
  return useQuery<Project>(
    route('/api/v1/projects/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/projects/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
  );
}
