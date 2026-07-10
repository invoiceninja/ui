/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';
import { Client } from '../interfaces/client';
import { GenericSingleResourceResponse } from '../interfaces/generic-api-response';
import { GenericQueryOptions } from './invoices';

interface BlankQueryParams {
  refetchOnWindowFocus?: boolean;
}

export function useBlankClientQuery(params: BlankQueryParams) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: ['/api/v1/clients/create'],

    queryFn: () =>
      request('GET', endpoint('/api/v1/clients/create')).then(
        (response) => response.data.data
      ),

    refetchOnWindowFocus: Boolean(params.refetchOnWindowFocus),
    staleTime: Infinity,
    enabled: hasPermission('create_client'),
  });
}

interface Props {
  enabled?: boolean;
  status?: string[];
}

export function useClientsQuery(props: Props) {
  return useQuery({
    queryKey: ['/api/v1/clients', 'per_page=500', props],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/clients?per_page=500&status=:status', {
          status: props.status?.join(',') ?? 'all',
        })
      ).then(
        (response: GenericSingleResourceResponse<Client[]>) =>
          response.data.data
      ),

    enabled: props.enabled ?? true,
    staleTime: Infinity,
  });
}

export function useClientQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery({
    queryKey: ['/api/v1/clients', id],

    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/clients/:id?include=group_settings,activities.history',
          { id }
        )
      ).then(
        (response: GenericSingleResourceResponse<Client>) => response.data.data
      ),

    enabled,
    staleTime: Infinity,
  });
}

const successMessages = {
  assign_group: 'updated_group',
  bulk_update: 'updated_records',
  clone: 'cloned_client',
};

interface Details {
  groupSettingsId?: string;
  column?: string;
  newValue?: string | number | boolean;
}

interface Params {
  onSuccess?: (clients: Client[]) => void;
}

export function useBulk({ onSuccess }: Params = {}) {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return async (
    ids: string[],
    action:
      | 'archive'
      | 'restore'
      | 'delete'
      | 'assign_group'
      | 'bulk_update'
      | 'clone',
    details?: Details
  ) => {
    const { groupSettingsId, column, newValue } = details || {};

    toast.processing();

    return request('POST', endpoint('/api/v1/clients/bulk'), {
      action,
      ids,
      ...(groupSettingsId && { group_settings_id: groupSettingsId }),
      ...(column && { column }),
      ...(action === 'bulk_update' && { new_value: newValue }),
    }).then((response) => {
      const message =
        successMessages[action as keyof typeof successMessages] ||
        `${action}d_client`;

      toast.success(message);

      onSuccess?.(response.data.data);

      invalidateQueryValue &&
        queryClient.invalidateQueries({
          queryKey: [invalidateQueryValue],
        });

      $refetch(['clients']);

      if (action === 'delete') {
        $refetch(['projects']);
      }
    });
  };
}
