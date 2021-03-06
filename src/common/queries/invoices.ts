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

export function useInvoiceQuery(
  params: { id: string | undefined },
  options: Record<string, any> = {}
) {
  return useQuery(
    generatePath('/api/v1/invoices/:id', { id: params.id }),
    () => request('GET', endpoint('/api/v1/invoices/:id', { id: params.id })),
    { ...options, staleTime: Infinity }
  );
}

export function useBlankInvoiceQuery(options: Record<string, any> = {}) {
  return useQuery(
    generatePath('/api/v1/invoices/create'),
    () => request('GET', endpoint('/api/v1/invoices/create')),
    { ...options, staleTime: Infinity }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete' | 'cancel'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/invoices/bulk'), {
    action,
    ids: Array.from(id),
  });
}
