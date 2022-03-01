/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { endpoint, request } from '../helpers';
import { defaultHeaders } from './common/headers';

export function usePaymentQuery(params: { id: string | undefined }) {
  return useQuery(
    generatePath('/api/v1/payments/:id', { id: params.id }),
    () =>
      axios.get(endpoint('/api/v1/payments/:id', { id: params.id }), {
        headers: defaultHeaders,
      }),
    { staleTime: Infinity }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<AxiosResponse> {
  return request(
    'POST',
    endpoint('/api/v1/payments/bulk'),
    {
      action,
      ids: Array.from(id),
    },
    { 'X-Api-Token': localStorage.getItem('X-NINJA-TOKEN') }
  );
}
