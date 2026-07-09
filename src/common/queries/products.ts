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
import { request } from '$app/common/helpers/request';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Product } from '$app/common/interfaces/product';
import { endpoint } from '../helpers';
import { Params } from './common/params.interface';
import { GenericQueryOptions } from './invoices';

interface ProductsParams extends Params {
  include?: string;
}

export function useProductsQuery(params?: ProductsParams) {
  return useQuery({
    queryKey: ['/api/v1/products'],

    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/products?per_page=500&include=:include&status=:status',
          {
            include: params?.include || '',
            status: params?.status ?? 'all',
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<Product[]>) =>
          response.data.data
      ),

    staleTime: Infinity,
  });
}

export function useProductQuery(params: { id: string | undefined }) {
  return useQuery({
    queryKey: ['/api/v1/products', params.id],
    queryFn: () =>
      request('GET', endpoint('/api/v1/products/:id', { id: params.id })),
    staleTime: Infinity,
  });
}
export function useBlankProductQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: ['/api/v1/products/create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/products/create')).then(
        (response: GenericSingleResourceResponse<Product>) => response.data.data
      ),

    ...options,
    staleTime: Infinity,

    enabled: hasPermission('create_product')
      ? (options?.enabled ?? true)
      : false,
  });
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
