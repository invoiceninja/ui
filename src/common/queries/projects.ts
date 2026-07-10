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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Project } from '$app/common/interfaces/project';
import { GenericQueryOptions } from './invoices';

export function useBlankProjectQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: ['/api/v1/projects/create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/projects/create')).then(
        (response: GenericSingleResourceResponse<Project>) => response.data.data
      ),

    ...options,
    staleTime: Infinity,

    enabled: hasPermission('create_project')
      ? (options?.enabled ?? true)
      : false,
  });
}

export function useProjectQuery(params: { id: string | undefined }) {
  return useQuery({
    queryKey: ['/api/v1/projects', params.id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/projects/:id?include=client', { id: params.id })
      ).then((response) => response.data.data),

    staleTime: Infinity,
  });
}

interface Params {
  status?: string[];
}

export function useProjectsQuery(params?: Params) {
  return useQuery({
    queryKey: ['/api/v1/projects', params],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/projects?status=:status&per_page=1000', {
          status: params?.status?.join(',') ?? 'all',
        })
      ).then(
        (response: GenericSingleResourceResponse<Project[]>) =>
          response.data.data
      ),

    staleTime: Infinity,
  });
}
