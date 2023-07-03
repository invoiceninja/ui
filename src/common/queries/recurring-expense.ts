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
import { useQuery, useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';
import { AxiosError } from 'axios';

interface BlankQueryParams {
  enabled?: boolean;
}

export function useBlankRecurringExpenseQuery(params: BlankQueryParams) {
  const hasPermission = useHasPermission();

  return useQuery<RecurringExpense>(
    '/api/v1/recurring_expenses/create',
    () =>
      request('GET', endpoint('/api/v1/recurring_expenses/create')).then(
        (response: GenericSingleResourceResponse<RecurringExpense>) =>
          response.data.data
      ),
    {
      enabled: hasPermission('create_recurring_expense')
        ? params.enabled ?? true
        : false,
      staleTime: Infinity,
    }
  );
}

interface Params {
  id: string | undefined;
  enabled?: boolean;
}

export function useRecurringExpenseQuery(params: Params) {
  return useQuery<RecurringExpense>(
    route('/api/v1/recurring_expenses/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/recurring_expenses/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<RecurringExpense>) =>
          response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

export function useBulk() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/recurring_expenses/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        toast.success(`${action}d_recurring_expense`);

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);

        queryClient.invalidateQueries(
          route('/api/v1/recurring_expenses/:id', { id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      });
  };
}
