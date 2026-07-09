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
import { AxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { Dispatch, SetStateAction } from 'react';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '$app/common/hooks/useRefetch';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericQueryOptions } from '$app/common/queries/invoices';

interface RecurringInvoiceQueryParams {
  id: string;
}

export function useRecurringInvoiceQuery(params: RecurringInvoiceQueryParams) {
  return useQuery({
    queryKey: ['/api/v1/recurring_invoices', params.id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/recurring_invoices/:id?include=client', {
          id: params.id,
        })
      ).then(
        (response: GenericSingleResourceResponse<RecurringInvoice>) =>
          response.data.data
      ),

    staleTime: Infinity,
    enabled: Boolean(params.id),
  });
}

export function useBlankRecurringInvoiceQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: ['/api/v1/recurring_invoices', 'create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/recurring_invoices/create')).then(
        (response: GenericSingleResourceResponse<RecurringInvoice>) =>
          response.data.data
      ),

    ...options,
    staleTime: Infinity,

    enabled: hasPermission('create_recurring_invoice')
      ? (options?.enabled ?? true)
      : false,
  });
}

type Action =
  | 'archive'
  | 'restore'
  | 'delete'
  | 'start'
  | 'stop'
  | 'update_prices'
  | 'increase_prices'
  | 'bulk_update';

const successMessages = {
  start: 'started_recurring_invoice',
  stop: 'stopped_recurring_invoice',
  update_prices: 'updated_prices',
  increase_prices: 'updated_prices',
  bulk_update: 'updated_records',
};

interface Params {
  onSuccess?: () => void;
  setErrors?: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function useBulkAction(params?: Params) {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  const { onSuccess, setErrors } = params || {};

  return async (
    ids: string[],
    action: Action,
    rest?: Record<string, unknown>
  ) => {
    toast.processing();

    return request('POST', endpoint('/api/v1/recurring_invoices/bulk'), {
      action,
      ids,
      ...rest,
    })
      .then(() => {
        const message =
          successMessages[action as keyof typeof successMessages] ||
          `${action}d_recurring_invoice`;

        toast.success(message);

        onSuccess?.();

        invalidateQueryValue &&
          queryClient.invalidateQueries({
            queryKey: [invalidateQueryValue],
          });

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
