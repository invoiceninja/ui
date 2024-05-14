/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Params } from './common/params.interface';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';

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
          '/api/v1/expense_categories?per_page=:perPage&page=:currentPage&sort=:sort&filter=:filter&status=:status',
          {
            perPage: params.perPage ?? '100',
            currentPage: params.currentPage ?? '1',
            sort: params.sort ?? 'name|asc',
            filter: params.filter ?? '',
            status: params.status?.join(',') ?? '',
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
    ['/api/v1/expense_categories', props.id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/expense_categories/:id', { id: props.id })
      ),
    { enabled: props.enabled ?? true, staleTime: Infinity }
  );
}

export function useBulkAction() {
  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/expense_categories/bulk'), {
      action,
      ids: [id],
    }).then(() => {
      toast.success(`${action}d_expense_category`);

      $refetch(['expense_categories']);
    });
  };
}

export function useBlankExpenseCategoryQuery() {
  const hasPermission = useHasPermission();

  return useQuery<ExpenseCategory>(
    '/api/v1/expense_categories/create',
    () =>
      request('GET', endpoint('/api/v1/expense_categories/create')).then(
        (response: GenericSingleResourceResponse<ExpenseCategory>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: hasPermission('create_expense') }
  );
}
