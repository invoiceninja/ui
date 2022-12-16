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
import { route } from 'common/helpers/route';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { TransactionResponse } from 'common/interfaces/transactions';
import { useQuery } from 'react-query';

interface TransactionParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useTransactionQuery(params: TransactionParams) {
  return useQuery<TransactionResponse>(
    route('/api/v1/bank_transactions/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_transactions/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<TransactionResponse>) =>
          response?.data?.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}
