/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { defaultHeaders } from './common/headers';
import { Params } from './common/params.interface';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';

export function usePaymentTermsQuery(params: Params) {
  return useQuery(
    ['/api/v1/payment_terms', params],
    () =>
      request(
        'GET',
        endpoint(
          '/api/v1/payment_terms?per_page=:perPage&page=:currentPage&sort=:sort',
          {
            perPage: params.perPage ?? 1000,
            currentPage: params.currentPage,
            sort: params.sort ?? 'id|asc',
          }
        )
      ),
    {
      staleTime: Infinity,
    }
  );
}

export function usePaymentTermQuery(params: { id: string | undefined }) {
  return useQuery(
    ['/api/v1/payment_terms', params],
    () =>
      request('GET', endpoint('/api/v1/payment_terms/:id', params), {
        headers: defaultHeaders(),
      }),
    { staleTime: Infinity }
  );
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

  return useQuery<PaymentTerm>(
    ['/api/v1/payment_terms/create'],
    () =>
      request('GET', endpoint('/api/v1/payment_terms/create')).then(
        (response: GenericSingleResourceResponse<PaymentTerm>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin }
  );
}
