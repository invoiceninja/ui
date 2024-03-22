/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Transaction } from '$app/common/interfaces/transactions';
import { useAtomValue } from 'jotai';
import { useQuery, useQueryClient } from 'react-query';
import { $refetch } from '../hooks/useRefetch';

interface TransactionParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useTransactionQuery(params: TransactionParams) {
  return useQuery<Transaction>(
    ['/api/v1/bank_transactions', params.id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_transactions/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<Transaction>) =>
          response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

export function useBlankTransactionQuery() {
  return useQuery<Transaction>(
    ['/api/v1/bank_transactions', 'create'],
    () =>
      request('GET', endpoint('/api/v1/bank_transactions/create')).then(
        (response: GenericSingleResourceResponse<Transaction>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}

const successMessages = {
  convert_matched: 'converted_transactions',
  unlink: 'unlinked_payment',
};

export const useBulk = () => {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action: 'archive' | 'restore' | 'delete' | 'convert_matched' | 'unlink'
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/bank_transactions/bulk'), {
      action,
      ids,
    }).then(() => {
      const message =
        successMessages[action as keyof typeof successMessages] ||
        `${action}d_invoice`;

      toast.success(message);

      $refetch(['bank_transactions']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
};
