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
import { Design } from '$app/common/interfaces/design';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { useQuery } from 'react-query';
import { AxiosResponse } from 'axios';
import { GenericQueryOptions } from '$app/common/queries/invoices';
import { route } from '$app/common/helpers/route';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';

export function useDesignsQuery() {
  return useQuery<Design[]>(
    ['/api/v1/designs'],
    () =>
      request('GET', endpoint('/api/v1/designs?status=active&template=false')).then(
        (response: AxiosResponse<GenericManyResponse<Design>>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}

interface DesignQueryOptions extends GenericQueryOptions {
  id: string | undefined;
}

export function useDesignQuery(params: DesignQueryOptions) {
  return useQuery<Design>(
    route('/api/v1/designs/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/designs/:id?include=client', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<Design>) => response.data.data
      ),
    { staleTime: Infinity, ...params }
  );
}

export function useBlankDesignQuery(options?: GenericQueryOptions) {
  return useQuery<Design>(
    route('/api/v1/designs/create'),
    () =>
      request('GET', endpoint('/api/v1/designs/create')).then(
        (response: GenericSingleResourceResponse<Design>) => response.data.data
      ),
    {
      ...options,
      staleTime: Infinity,
    }
  );
}
