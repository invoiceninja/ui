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
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { Params } from '$app/common/queries/common/params.interface';

interface BankAccountParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useBankAccountQuery(params: BankAccountParams) {
  const { isAdmin, isOwner } = useAdmin();

  return useQuery<BankAccount>(
    ['/api/v1/bank_integrations', params.id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_integrations/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<BankAccount>) =>
          response.data.data
      ),
    {
      enabled: (params.enabled ?? true) && (isAdmin || isOwner),
      staleTime: Infinity,
    }
  );
}

export function useBankAccountsQuery(params?: Params) {
  const { perPage } = params || {};

  return useQuery<BankAccount[]>(
    ['/api/v1/bank_integrations', params],
    () =>
      request(
        'GET',
        endpoint('/api/v1/bank_integrations?per_page=:perPage&status=active', {
          perPage: perPage ?? 20,
        })
      ).then(
        (response: GenericSingleResourceResponse<BankAccount[]>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useBlankBankAccountQuery() {
  const { isAdmin, isOwner } = useAdmin();

  return useQuery<BankAccount>(
    ['/api/v1/bank_integrations', 'create'],
    () =>
      request('GET', endpoint('/api/v1/bank_integrations/create')).then(
        (response: GenericSingleResourceResponse<BankAccount>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin || isOwner }
  );
}
