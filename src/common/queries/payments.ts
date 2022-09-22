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

export function usePaymentQuery(params: { id: string | undefined }) {
  return useQuery(
    route('/api/v1/payments/:id?include=client,invoices,paymentables', {
      id: params.id,
    }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/payments/:id?include=client,invoices,paymentables', {
          id: params.id,
        })
      ),
    { staleTime: Infinity }
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
