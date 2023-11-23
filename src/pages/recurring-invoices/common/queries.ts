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
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { GenericQueryOptions } from '$app/common/queries/invoices';
import { useQuery, useQueryClient } from 'react-query';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

interface RecurringInvoiceQueryParams {
  id: string;
}

export function useRecurringInvoiceQuery(params: RecurringInvoiceQueryParams) {
  return useQuery<RecurringInvoice>(
    ['/api/v1/recurring_invoices', params.id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/recurring_invoices/:id?include=client', {
          id: params.id,
        })
      ).then(
        (response: GenericSingleResourceResponse<RecurringInvoice>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: Boolean(params.id) }
  );
}

export function useBlankRecurringInvoiceQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery<RecurringInvoice>(
    ['/api/v1/recurring_invoices', 'create'],
    () =>
      request('GET', endpoint('/api/v1/recurring_invoices/create')).then(
        (response: GenericSingleResourceResponse<RecurringInvoice>) =>
          response.data.data
      ),
    {
      ...options,
      staleTime: Infinity,
      enabled: hasPermission('create_recurring_invoice')
        ? options?.enabled ?? true
        : false,
    }
  );
}

type Action =
  | 'archive'
  | 'restore'
  | 'delete'
  | 'start'
  | 'stop'
  | 'update_prices'
  | 'increase_prices';

const successMessages = {
  start: 'started_recurring_invoice',
  stop: 'stopped_recurring_invoice',
  update_prices: 'updated_prices',
  increase_prices: 'updated_prices',
};

interface Params {
  onSuccess?: () => void;
  setErrors?: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function useBulkAction(params?: Params) {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  const { onSuccess, setErrors } = params || {};

  return (ids: string[], action: Action, increasePercentage?: number) => {
    toast.processing();

    request('POST', endpoint('/api/v1/recurring_invoices/bulk'), {
      action,
      ids,
      ...(typeof increasePercentage === 'number' && {
        percentage_increase: increasePercentage,
      }),
    })
      .then(() => {
        const message =
          successMessages[action as keyof typeof successMessages] ||
          `${action}d_recurring_invoice`;

        toast.success(message);

        onSuccess?.();

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);

        $refetch(['recurring_invoices']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors?.(error.response.data);
          toast.dismiss();
        }
      });
  };
}
