/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { Expense } from 'common/interfaces/expense';
import { useQuery } from 'react-query';
import { route } from 'common/helpers/route';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Params } from './common/params.interface';

export function useBlankExpenseQuery() {
  return useQuery<Expense>(
    route('/api/v1/expenses/create'),
    () =>
      request('GET', endpoint('/api/v1/expenses/create')).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
  );
}

interface ExpenseParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useExpenseQuery(params: ExpenseParams) {
  return useQuery<Expense>(
    route('/api/v1/expenses/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/expenses/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

interface ExpensesParams extends Params {
  enabled?: boolean;
  matchTransactions?: boolean;
}

export function useExpensesQuery(params: ExpensesParams) {
  return useQuery<Expense[]>(
    ['/api/v1/expenses', params],
    () =>
      request(
        'GET',
        endpoint(
          '/api/v1/expenses?filter=:filter&per_page=:per_page&status=:status&page=:page&match_transactions=:match_transactions',
          {
            per_page: params.perPage ?? '100',
            page: params.currentPage ?? '1',
            status: params.status ?? 'active',
            filter: params.filter ?? '',
            match_transactions: params.matchTransactions ?? false,
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<Expense[]>) =>
          response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}
