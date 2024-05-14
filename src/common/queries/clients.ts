/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery, useQueryClient } from 'react-query';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { GenericQueryOptions } from './invoices';
import { Client } from '../interfaces/client';
import { GenericSingleResourceResponse } from '../interfaces/generic-api-response';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';
import { $refetch } from '../hooks/useRefetch';

interface BlankQueryParams {
  refetchOnWindowFocus?: boolean;
}

export function useBlankClientQuery(params: BlankQueryParams) {
  const hasPermission = useHasPermission();

  return useQuery(
    '/api/v1/clients/create',
    () =>
      request('GET', endpoint('/api/v1/clients/create')).then(
        (response) => response.data.data
      ),
    {
      refetchOnWindowFocus: Boolean(params.refetchOnWindowFocus),
      staleTime: Infinity,
      enabled: hasPermission('create_client'),
    }
  );
}

interface Props {
  enabled?: boolean;
  status?: string[];
}

export function useClientsQuery(props: Props) {
  return useQuery(
    ['/api/v1/clients', 'per_page=500', props],
    () =>
      request(
        'GET',
        endpoint('/api/v1/clients?per_page=500&status=:status', {
          status: props.status?.join(',') ?? 'all',
        })
      ).then(
        (response: GenericSingleResourceResponse<Client[]>) =>
          response.data.data
      ),
    { enabled: props.enabled ?? true, staleTime: Infinity }
  );
}

export function useClientQuery({ id, enabled }: GenericQueryOptions) {
  return useQuery(
    ['/api/v1/clients', id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/clients/:id?include=group_settings', { id })
      ).then(
        (response: GenericSingleResourceResponse<Client>) => response.data.data
      ),
    {
      enabled,
      staleTime: Infinity,
    }
  );
}

const successMessages = {
  assign_group: 'updated_group',
};

export function useBulk() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action: 'archive' | 'restore' | 'delete' | 'assign_group',
    groupSettingsId?: string
  ) => {
    toast.processing();

    return request('POST', endpoint('/api/v1/clients/bulk'), {
      action,
      ids,
      ...(groupSettingsId && { group_settings_id: groupSettingsId }),
    }).then(() => {
      const message =
        successMessages[action as keyof typeof successMessages] ||
        `${action}d_client`;

      toast.success(message);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);

      $refetch(['clients']);
    });
  };
}
