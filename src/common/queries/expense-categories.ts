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
import { route } from 'common/helpers/route';
import { Params } from './common/params.interface';
import { ExpenseCategory } from 'common/interfaces/expense-category';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

export function useExpenseCategoriesQuery(params?: Params) {
  return useQuery<ExpenseCategory[]>(
    ['/api/v1/expense_categories', params],
    () =>
      request(
        'GET',
        endpoint(
          '/api/v1/expense_categories?per_page=:perPage&page=:currentPage&sort=:sort&filter=:filter',
          {
            perPage: params?.perPage,
            currentPage: params?.currentPage,
            sort: params?.sort ?? 'id|asc',
            filter: params?.filter,
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<ExpenseCategory[]>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useExpenseCategoryQuery(params: { id: string | undefined }) {
  return useQuery(
    route('/api/v1/expense_categories/:id', params),
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
