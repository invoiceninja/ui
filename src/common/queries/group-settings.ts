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
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';
import { GenericSingleResourceResponse } from '../interfaces/generic-api-response';
import { GroupSettings } from '../interfaces/group-settings';
import { Params as GlobalParams } from './common/params.interface';

export function useGroupSettingsQuery(params?: GlobalParams) {
  return useQuery({
    queryKey: ['/api/v1/group_settings', params],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/group_settings?status=:status&per_page=:perPage', {
          status: params?.status ?? 'active',
          perPage: params?.perPage ?? 20,
        })
      ).then(
        (response: GenericSingleResourceResponse<GroupSettings[]>) =>
          response.data.data
      ),

    staleTime: Infinity,
  });
}

interface Params {
  id: string | undefined;
}

export function useGroupQuery(params: Params) {
  const { id } = params;

  return useQuery({
    queryKey: ['/api/v1/group_settings', id],

    queryFn: () =>
      request('GET', endpoint('/api/v1/group_settings/:id', { id })).then(
        (response: GenericSingleResourceResponse<GroupSettings>) =>
          response.data.data
      ),

    staleTime: Infinity,
  });
}

export function useBulk() {
  return (ids: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/group_settings/bulk'), {
      action,
      ids,
    }).then(() => {
      toast.success(`${action}d_group`);

      $refetch(['group_settings']);
    });
  };
}
