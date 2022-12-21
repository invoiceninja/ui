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
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { route } from 'common/helpers/route';
import { endpoint } from '../helpers';
import { Payment } from 'common/interfaces/payment';
import { Params } from './common/params.interface';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

interface PaymentParams {
  id: string | undefined;
  enabled?: boolean;
}

export function usePaymentQuery(params: PaymentParams) {
  return useQuery(
    route('/api/v1/payments/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/payments/:id?include=client,invoices,paymentables', {
          id: params.id,
        })
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

interface PaymentsParams extends Params {
  enabled?: boolean;
  matchTransactions?: boolean;
}

export function usePaymentsQuery(params: PaymentsParams) {
  return useQuery<Payment[]>(
    ['/api/v1/payments', params],
    () =>
      request(
        'GET',
        endpoint(
          '/api/v1/payments?filter=:filter&per_page=:per_page&status=:status&page=:page&match_transactions=:match_transactions',
          {
            per_page: params.perPage ?? '100',
            page: params.currentPage ?? '1',
            status: params.status ?? 'active',
            filter: params.filter ?? '',
            match_transactions: params.matchTransactions ?? false,
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<Payment[]>) =>
          response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

export function useBlankPaymentQuery() {
  return useQuery(
    route('/api/v1/payments/create'),
    () => request('GET', endpoint('/api/v1/payments/create')),
    { staleTime: Infinity }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete' | 'email'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/payments/bulk'), {
    action,
    ids: Array.from(id),
  });
}
