/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';

export function useBlankRecurringInvoiceQuery(
  options: Record<string, any> = {}
) {
  return useQuery(
    generatePath('/api/v1/recurring_invoices/create'),
    () => request('GET', endpoint('/api/v1/recurring_invoices/create')),
    { ...options, staleTime: Infinity }
  );
}

export function useRecurringInvoiceQuery(
  params: { id: string | undefined },
  options: Record<string, any> = {}
) {
  return useQuery(
    generatePath('/api/v1/recurring_invoices/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/recurring_invoices/:id', { id: params.id })
      ),
    { ...options, staleTime: Infinity }
  );
}
