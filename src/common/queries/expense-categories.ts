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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Params } from './common/params.interface';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';

interface ExpenseCategoriesParams extends Params {
  enabled?: boolean;
}

export function useExpenseCategoriesQuery(params: ExpenseCategoriesParams) {
  return useQuery<ExpenseCategory[]>(
    ['/api/v1/expense_categories', params],
    () =>
      request(
        'GET',
        endpoint(
          '/api/v1/expense_categories?per_page=:perPage&page=:currentPage&sort=:sort&filter=:filter',
          {
            perPage: params.perPage ?? '100',
            currentPage: params.currentPage ?? '1',
            sort: params.sort ?? 'id|asc',
            filter: params.filter ?? '',
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<ExpenseCategory[]>) =>
          response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

interface Props {
  id: string | undefined;
  enabled?: boolean;
}

export function useExpenseCategoryQuery(props: Props) {
  return useQuery(
    route('/api/v1/expense_categories/:id', { id: props.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/expense_categories/:id', { id: props.id })
      ),
    { enabled: props.enabled ?? true, staleTime: Infinity }
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
