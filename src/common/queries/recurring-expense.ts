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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';

interface BlankQueryParams {
  enabled?: boolean;
}

export function useBlankRecurringExpenseQuery(params: BlankQueryParams) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: ['/api/v1/recurring_expenses', 'create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/recurring_expenses/create')).then(
        (response: GenericSingleResourceResponse<RecurringExpense>) =>
          response.data.data
      ),

    enabled: hasPermission('create_recurring_expense')
      ? (params.enabled ?? true)
      : false,

    staleTime: Infinity,
  });
}

interface Params {
  id: string | undefined;
  enabled?: boolean;
}

export function useRecurringExpenseQuery(params: Params) {
  return useQuery({
    queryKey: ['/api/v1/recurring_expenses', params.id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/recurring_expenses/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<RecurringExpense>) =>
          response.data.data
      ),

    enabled: params.enabled ?? true,
    staleTime: Infinity,
  });
}

const successMessages = {
  start: 'started_recurring_expense',
  stop: 'stopped_recurring_expense',
};

export const useBulk = () => {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action: 'archive' | 'restore' | 'delete' | 'start' | 'stop'
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/recurring_expenses/bulk'), {
      action,
      ids,
    }).then(() => {
      const message =
        successMessages[action as keyof typeof successMessages] ||
        `${action}d_recurring_expense`;

      toast.success(message);

      invalidateQueryValue &&
        queryClient.invalidateQueries({
          queryKey: [invalidateQueryValue],
        });

      $refetch(['recurring_expenses']);
    });
  };
};
