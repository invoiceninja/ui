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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { Params } from './common/params.interface';

export function useExpenseCategoriesQuery(params: Params) {
  return useQuery(['/api/v1/expense_categories', params], () =>
    request(
      'GET',
      endpoint(
        '/api/v1/expense_categories?per_page=:perPage&page=:currentPage&sort=:sort',
        {
          perPage: params.perPage,
          currentPage: params.currentPage,
          sort: params.sort ?? 'id|asc',
        }
      )
    )
  );
}

export function useExpenseCategoryQuery(params: { id: string | undefined }) {
  return useQuery(
    generatePath('/api/v1/expense_categories/:id', params),
    () => request('GET', endpoint('/api/v1/expense_categories/:id', params)),
    { staleTime: Infinity }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/expense_categories/bulk'), {
    action,
    ids: id,
  });
}
