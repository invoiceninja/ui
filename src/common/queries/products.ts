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
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { route } from '$app/common/helpers/route';
import { endpoint } from '../helpers';
import { Product } from '$app/common/interfaces/product';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GenericQueryOptions } from './invoices';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export function useProductsQuery() {
  return useQuery<Product[]>(
    '/api/v1/products',
    () =>
      request('GET', endpoint('/api/v1/products?per_page=500')).then(
        (response: GenericSingleResourceResponse<Product[]>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useProductQuery(params: { id: string | undefined }) {
  return useQuery(
    route('/api/v1/products/:id', { id: params.id }),
    () => request('GET', endpoint('/api/v1/products/:id', { id: params.id })),
    { staleTime: Infinity }
  );
}
export function useBlankProductQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery(
    route('/api/v1/products/create'),
    () =>
      request('GET', endpoint('/api/v1/products/create')).then(
        (response: GenericSingleResourceResponse<Product>) => response.data.data
      ),
    {
      ...options,
      staleTime: Infinity,
      enabled: hasPermission('create_product'),
    }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/products/bulk'), {
    action,
    ids: Array.from(id),
  });
}
