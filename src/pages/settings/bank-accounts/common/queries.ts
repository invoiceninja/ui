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
import { useQuery } from 'react-query';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import {
  BankAccount,
  BankAccountDetails,
} from 'common/interfaces/bank-accounts';
import { route } from 'common/helpers/route';

interface BankAccountParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useBankAccountQuery(params: BankAccountParams) {
  return useQuery<BankAccountDetails>(
    route('/api/v1/bank_integrations/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_integrations/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<BankAccountDetails>) =>
          response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

export function useBankAccountsQuery() {
  return useQuery<BankAccount[]>(
    '/api/v1/bank_integrations',
    () =>
      request('GET', endpoint('/api/v1/bank_integrations')).then(
        (response: GenericSingleResourceResponse<BankAccount[]>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
