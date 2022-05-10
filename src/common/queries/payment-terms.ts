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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { defaultHeaders } from './common/headers';
import { Params } from './common/params.interface';

export function usePaymentTermsQuery(params: Params) {
  return useQuery(['/api/v1/payment_terms', params], () =>
    request(
      'GET',
      endpoint(
        '/api/v1/payment_terms?per_page=:perPage&page=:currentPage&sort=:sort',
        {
          perPage: params.perPage,
          currentPage: params.currentPage,
          sort: params.sort ?? 'id|asc',
        }
      )
    )
  );
}

export function usePaymentTermQuery(params: { id: string | undefined }) {
  return useQuery(
    generatePath('/api/v1/payment_terms/:id', params),
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
