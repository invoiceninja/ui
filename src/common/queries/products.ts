/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosResponse } from 'axios';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { endpoint } from '../helpers';
import { defaultHeaders } from './common/headers';
import { Params } from './common/params.interface';

export function useProductsQuery(params: Params) {
  return useQuery(['/api/v1/products', params], () => {
    return axios.get(
      endpoint(
        '/api/v1/products?per_page=:perPage&page=:currentPage&filter=:filter&status=:status&sort=:sort',
        {
          perPage: params.perPage,
          currentPage: params.currentPage,
          filter: params.filter,
          status: params.status,
          sort: params.sort ?? 'id|asc',
        }
      ),
      { headers: defaultHeaders() }
    );
  });
}

export function useProductQuery(params: { id: string | undefined }) {
  return useQuery(
    generatePath('/api/v1/products/:id', { id: params.id }),
    () =>
      axios.get(endpoint('/api/v1/products/:id', { id: params.id }), {
        headers: defaultHeaders(),
      }),
    { staleTime: Infinity }
  );
}
export function useBlankProductQuery() {
  return useQuery(
    generatePath('/api/v1/products/create'),
    () =>
      axios.get(endpoint('/api/v1/products/create'), {
        headers: defaultHeaders(),
      }),
    { staleTime: Infinity }
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
