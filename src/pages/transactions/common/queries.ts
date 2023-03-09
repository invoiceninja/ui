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
import { route } from '$app/common/helpers/route';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Transaction } from '$app/common/interfaces/transactions';
import { useQuery } from 'react-query';

interface TransactionParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useTransactionQuery(params: TransactionParams) {
  return useQuery<Transaction>(
    route('/api/v1/bank_transactions/:id', { id: params.id }),
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
    '/api/v1/bank_transactions/create',
    () =>
      request('GET', endpoint('/api/v1/bank_transactions/create')).then(
        (response: GenericSingleResourceResponse<Transaction>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
