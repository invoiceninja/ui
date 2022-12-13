/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from 'common/helpers/request';
import { Vendor } from 'common/interfaces/vendor';
import { useQuery } from 'react-query';
import { route } from 'common/helpers/route';
import { endpoint } from '../helpers';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Params } from './common/params.interface';

interface VendorParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useVendorQuery(params: VendorParams) {
  return useQuery<Vendor>(
    route('/api/v1/vendors/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/vendors/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

export function useBlankVendorQuery() {
  return useQuery<Vendor>(
    '/api/v1/vendors/create',
    () =>
      request('GET', endpoint('/api/v1/vendors/create')).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
  );
}

interface VendorsParams extends Params {
  enabled?: boolean;
  withoutDeletedClients?: boolean;
}

export function useVendorsQuery(params: VendorsParams) {
  return useQuery<Vendor[]>(
    ['/api/v1/vendors', params],
    () =>
      request(
        'GET',
        endpoint(
          '/api/v1/vendors?filter=:filter&per_page=:per_page&status=:status&page=:page',
          {
            per_page: params.perPage ?? '100',
            page: params.currentPage ?? '1',
            status: params.status ?? 'active',
            filter: params.filter ?? '',
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<Vendor[]>) =>
          response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}
