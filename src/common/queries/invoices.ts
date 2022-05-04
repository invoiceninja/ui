/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { defaultHeaders } from './common/headers';

export function useInvoiceQuery(
  params: { id: string | undefined },
  options: Record<string, any> = {}
) {
  return useQuery(
    generatePath('/api/v1/invoices/:id', { id: params.id }),
    () =>
      axios.get(endpoint('/api/v1/invoices/:id', { id: params.id }), {
        headers: defaultHeaders(),
      }),
    { ...options, staleTime: Infinity }
  );
}

export function useBlankInvoiceQuery(options: Record<string, any> = {}) {
  return useQuery(
    generatePath('/api/v1/invoices/create'),
    () =>
      axios.get(endpoint('/api/v1/invoices/create'), {
        headers: defaultHeaders(),
      }),
    { ...options, staleTime: Infinity }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<AxiosResponse> {
  return axios.post(
    endpoint('/api/v1/invoices/bulk'),
    {
      action,
      ids: Array.from(id),
    },
    { headers: defaultHeaders() }
  );
}
