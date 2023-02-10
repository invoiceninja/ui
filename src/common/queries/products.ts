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
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { route } from 'common/helpers/route';
import { endpoint } from '../helpers';
import { Product } from 'common/interfaces/product';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { GenericQueryOptions } from './invoices';

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
  return useQuery(
    route('/api/v1/products/create'),
    () =>
      request('GET', endpoint('/api/v1/products/create')).then(
        (response: GenericSingleResourceResponse<Product>) => response.data.data
      ),
    { ...options, staleTime: Infinity }
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
