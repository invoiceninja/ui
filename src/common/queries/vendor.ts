/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from '$app/common/helpers/request';
import { Vendor } from '$app/common/interfaces/vendor';
import { useQuery } from 'react-query';
import { endpoint } from '../helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Params } from './common/params.interface';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';
import { useHasPermission } from '../hooks/permissions/useHasPermission';

interface VendorParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useVendorQuery(params: VendorParams) {
  return useQuery<Vendor>(
    ['/api/v1/vendors', params.id],
    () =>
      request('GET', endpoint('/api/v1/vendors/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { enabled: params.enabled ?? true, staleTime: Infinity }
  );
}

export function useBlankVendorQuery() {
  const hasPermission = useHasPermission();

  return useQuery<Vendor>(
    ['/api/v1/vendors', 'create'],
    () =>
      request('GET', endpoint('/api/v1/vendors/create')).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity, enabled: hasPermission('create_vendor') }
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

export function useBulkAction() {
  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/vendors/bulk'), {
      action,
      ids: [id],
    }).then(() => {
      toast.success(`${action}d_vendor`);

      $refetch(['vendors']);
    });
  };
}
