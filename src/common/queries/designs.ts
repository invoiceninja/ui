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
import { AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { Design } from '$app/common/interfaces/design';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { GenericQueryOptions } from '$app/common/queries/invoices';
import { enterprisePlan } from '../guards/guards/enterprise-plan';
import { proPlan } from '../guards/guards/pro-plan';
import { useAdmin } from '../hooks/permissions/useHasPermission';
import { useFreePlanDesigns } from '../hooks/useFreePlanDesigns';

export function useDesignsQuery() {
  const freePlanDesigns = useFreePlanDesigns();

  return useQuery({
    queryKey: ['/api/v1/designs'],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/designs?status=active&sort=name|asc&per_page=100')
      ).then((response: AxiosResponse<GenericManyResponse<Design>>) =>
        response.data.data.filter(
          (design) =>
            freePlanDesigns.includes(design.name) ||
            proPlan() ||
            enterprisePlan()
        )
      ),

    staleTime: Infinity,
  });
}

interface DesignQueryOptions extends GenericQueryOptions {
  id: string | undefined;
}

export function useDesignQuery(params: DesignQueryOptions) {
  return useQuery({
    queryKey: ['/api/v1/designs', params.id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/designs/:id?include=client', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<Design>) => response.data.data
      ),

    staleTime: Infinity,
    ...params,
  });
}

export function useBlankDesignQuery(options?: GenericQueryOptions) {
  const { isAdmin } = useAdmin();

  return useQuery({
    queryKey: [route('/api/v1/designs/create')],

    queryFn: () =>
      request('GET', endpoint('/api/v1/designs/create')).then(
        (response: GenericSingleResourceResponse<Design>) => response.data.data
      ),

    ...options,
    staleTime: Infinity,
    enabled: isAdmin ? (options?.enabled ?? true) : false,
  });
}

export function useTemplateQuery(entity: string) {
  return useQuery({
    queryKey: ['/api/v1/designs', '?template=true&entities=', entity],

    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/designs?template=true&status=active&sort=name|asc&entities=' +
            entity
        )
      ).then(
        (response: AxiosResponse<GenericManyResponse<Design>>) =>
          response.data.data
      ),

    staleTime: Infinity,
  });
}
