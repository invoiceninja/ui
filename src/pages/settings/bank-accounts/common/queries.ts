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
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { route } from '$app/common/helpers/route';

interface BankAccountParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useBankAccountQuery(params: BankAccountParams) {
  return useQuery<BankAccount>(
    route('/api/v1/bank_integrations/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_integrations/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<BankAccount>) =>
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

export function useBlankBankAccountQuery() {
  return useQuery<BankAccount>(
    '/api/v1/bank_integrations/create',
    () =>
      request('GET', endpoint('/api/v1/bank_integrations/create')).then(
        (response: GenericSingleResourceResponse<BankAccount>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
