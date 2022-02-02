/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { defaultHeaders } from './common/headers';
import { Params } from './common/params.interface';

export function useExpenseCategoriesQuery(params: Params) {
  return useQuery(['/api/v1/expense_categories', params], () =>
    axios.get(
      endpoint(
        '/api/v1/expense_categories?per_page=:perPage&page=:currentPage&sort=:sort',
        {
          perPage: params.perPage,
          currentPage: params.currentPage,
          sort: params.sort ?? 'id|asc',
        }
      ),
      { headers: defaultHeaders }
    )
  );
}

export function useExpenseCategoryQuery(params: { id: string | undefined }) {
  return useQuery(
    generatePath('/api/v1/expense_categories/:id', params),
    () =>
      axios.get(endpoint('/api/v1/expense_categories/:id', params), {
        headers: defaultHeaders,
      }),
    { staleTime: Infinity }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<AxiosResponse> {
  return axios.post(
    endpoint('/api/v1/expense_categories/bulk'),
    {
      action,
      ids: id,
    },
    { headers: { ...defaultHeaders } }
  );
}
