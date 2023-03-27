/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery, useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Params } from './common/params.interface';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { toast } from '$app/common/helpers/toast/toast';

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

export function useBulkAction() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/expense_categories/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        toast.success(`${action}d_expense_category`);

        queryClient.invalidateQueries('/api/v1/expense_categories');

        queryClient.invalidateQueries(
          route('/api/v1/expense_categories/:id', { id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.error();
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
