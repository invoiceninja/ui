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
import { AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { defaultHeaders } from './common/headers';
import { Params } from './common/params.interface';

export function usePaymentTermsQuery(params: Params) {
  return useQuery({
    queryKey: ['/api/v1/payment_terms', params],

    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/payment_terms?per_page=:perPage&page=:currentPage&sort=:sort&status=:status',
          {
            perPage: params.perPage ?? 1000,
            currentPage: params.currentPage,
            sort: params.sort ?? 'id|asc',
            status: params.status ?? 'all',
          }
        )
      ),

    staleTime: Infinity,
  });
}

export function usePaymentTermQuery(params: { id: string | undefined }) {
  return useQuery({
    queryKey: ['/api/v1/payment_terms', params],

    queryFn: () =>
      request('GET', endpoint('/api/v1/payment_terms/:id', params), {
        headers: defaultHeaders(),
      }),

    staleTime: Infinity,
  });
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/payment_terms/bulk'), {
    action,
    ids: id,
  });
}

export function useBlankPaymentTermQuery() {
  const { isAdmin } = useAdmin();

  return useQuery({
    queryKey: ['/api/v1/payment_terms/create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/payment_terms/create')).then(
        (response: GenericSingleResourceResponse<PaymentTerm>) =>
          response.data.data
      ),

    staleTime: Infinity,
    enabled: isAdmin,
  });
}
