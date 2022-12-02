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

export function useVendorQuery(params: { id: string | undefined }) {
  return useQuery<Vendor>(
    route('/api/v1/vendors/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/vendors/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
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

export function useVendorsQuery(params?: Params) {
  return useQuery<Vendor[]>(
    ['/api/v1/vendors', params],
    () =>
      request(
        'GET',
        endpoint('/api/v1/vendors?filter=:filter', {
          filter: params?.filter,
        })
      ).then(
        (response: GenericSingleResourceResponse<Vendor[]>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
