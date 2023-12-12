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
import { Params } from './common/params.interface';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';

export function useTaxRatesQuery(params: Params) {
  return useQuery(
    ['/api/v1/tax_rates', params],
    () =>
      request(
        'GET',
        endpoint(
          '/api/v1/tax_rates?per_page=:perPage&page=:currentPage&sort=:sort&status=:status',
          {
            perPage: params.perPage ?? 1000,
            currentPage: params.currentPage,
            sort: params.sort ?? 'id|asc',
            status: params.status ?? 'all',
          }
        )
      ),
    { staleTime: Infinity }
  );
}

export function useTaxRateQuery(params: { id: string | undefined }) {
  return useQuery(
    ['/api/v1/tax_rates', params.id],
    () => request('GET', endpoint('/api/v1/tax_rates/:id', { id: params.id })),
    { staleTime: Infinity }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/tax_rates/bulk'), {
    action,
    ids: id,
  });
}

export function useBlankTaxRateQuery() {
  const { isAdmin } = useAdmin();

  return useQuery<TaxRate>(
    ['/api/v1/tax_rates', 'create'],
    () =>
      request('GET', endpoint('/api/v1/tax_rates/create')).then(
        (response: GenericSingleResourceResponse<TaxRate>) => response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin }
  );
}

export function useBulkAction() {
  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/tax_rates/bulk'), {
      action,
      ids: [id],
    }).then(() => {
      toast.success(`${action}d_tax_rate`);

      $refetch(['tax_rates']);
    });
  };
}
