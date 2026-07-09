/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Credit } from '$app/common/interfaces/credit';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GenericQueryOptions } from '$app/common/queries/invoices';

export function useBlankCreditQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: ['/api/v1/credits', 'create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/credits/create')).then(
        (response: GenericSingleResourceResponse<Credit>) => response.data.data
      ),

    ...options,
    staleTime: Infinity,

    enabled: hasPermission('create_credit')
      ? (options?.enabled ?? true)
      : false,
  });
}

interface CreditQueryProps {
  id: string;
}

export function useCreditQuery({ id }: CreditQueryProps) {
  return useQuery({
    queryKey: ['/api/v1/credits', id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/credits/:id?include=client', { id })
      ).then(
        (response: GenericSingleResourceResponse<Credit>) => response.data.data
      ),

    staleTime: Infinity,
  });
}
