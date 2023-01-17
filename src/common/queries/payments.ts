/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { request } from 'common/helpers/request';
import { useQuery, useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';
import { endpoint } from '../helpers';
import { Payment } from 'common/interfaces/payment';
import { Params } from './common/params.interface';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { toast } from 'common/helpers/toast/toast';

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

export function useBulk() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete' | 'email') => {
    toast.processing();

    request('POST', endpoint('/api/v1/payments/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        const translationKeyword = action === 'email' ? 'emaile' : action;

        toast.success(`${translationKeyword}d_payment`);

        queryClient.invalidateQueries(route('/api/v1/payments/:id', { id }));
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      });
  };
}
