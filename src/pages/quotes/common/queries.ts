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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Quote } from '$app/common/interfaces/quote';
import { GenericQueryOptions } from '$app/common/queries/invoices';

export function useBlankQuoteQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: ['/api/v1/quotes', 'create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/quotes/create')).then(
        (response: GenericSingleResourceResponse<Quote>) => response.data.data
      ),

    ...options,
    staleTime: Infinity,

    enabled: hasPermission('create_quote') ? (options?.enabled ?? true) : false,
  });
}

interface QuoteQueryParams {
  id: string;
}

export function useQuoteQuery({ id }: QuoteQueryParams) {
  return useQuery({
    queryKey: ['/api/v1/quotes', id],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/quotes/:id?include=client', { id })
      ).then(
        (response: GenericSingleResourceResponse<Quote>) => response.data.data
      ),

    staleTime: Infinity,
    enabled: Boolean(id),
  });
}
