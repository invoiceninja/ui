/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Expense } from '$app/common/interfaces/expense';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { $refetch } from '../hooks/useRefetch';
import { Params } from './common/params.interface';

interface BlankQueryParams {
  enabled?: boolean;
}

export function useBlankExpenseQuery(params: BlankQueryParams) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: [route('/api/v1/expenses/create')],

    queryFn: () =>
      request('GET', endpoint('/api/v1/expenses/create')).then(
        (response) => response.data.data
      ),

    enabled: hasPermission('create_expense') ? (params.enabled ?? true) : false,

    staleTime: Infinity,
  });
}

interface ExpenseParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useExpenseQuery(params: ExpenseParams) {
  return useQuery({
    queryKey: ['/api/v1/expenses', params.id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/expenses/:id?include=category', { id: params.id })
      ).then((response) => response.data.data),

    enabled: params.enabled ?? true,
    staleTime: Infinity,
  });
}

interface ExpensesParams extends Params {
  enabled?: boolean;
  matchTransactions?: boolean;
  include?: string;
  with?: string;
}

export function useExpensesQuery(params: ExpensesParams) {
  return useQuery({
    queryKey: ['/api/v1/expenses', params],

    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/expenses?filter=:filter&per_page=:per_page&status=:status&page=:page&match_transactions=:match_transactions&include=:include&with=:with',
          {
            per_page: params.perPage ?? '100',
            page: params.currentPage ?? '1',
            status: params.status ?? 'active',
            filter: params.filter ?? '',
            match_transactions: params.matchTransactions ?? false,
            includes: 'category',
            include: params.include || '',
            with: params.with || '',
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<Expense[]>) =>
          response.data.data
      ),

    enabled: params.enabled ?? true,
    staleTime: Infinity,
  });
}

const successMessages = {
  bulk_update: 'updated_records',
};

export function useBulk() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action:
      | 'archive'
      | 'restore'
      | 'delete'
      | 'bulk_categorize'
      | 'bulk_update',
    rest?: Record<string, unknown>
  ) => {
    toast.processing();

    return request('POST', endpoint('/api/v1/expenses/bulk'), {
      action,
      ids,
      ...rest,
    }).then(() => {
      const message =
        successMessages[action as keyof typeof successMessages] ||
        `${action}d_expense`;

      toast.success(message);

      invalidateQueryValue &&
        queryClient.invalidateQueries({
          queryKey: [invalidateQueryValue],
        });

      $refetch(['expenses']);
    });
  };
}
