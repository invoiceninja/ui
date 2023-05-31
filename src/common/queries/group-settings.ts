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
import { route } from '../helpers/route';
import { GenericSingleResourceResponse } from '../interfaces/generic-api-response';
import { GroupSettings } from '../interfaces/group-settings';
import { toast } from '../helpers/toast/toast';
import { AxiosError } from 'axios';

export function useGroupSettingsQuery() {
  return useQuery('/api/v1/group_settings', () => {
    return request('GET', endpoint('/api/v1/group_settings'));
  });
}

interface Params {
  id: string | undefined;
}

export function useGroupQuery(params: Params) {
  const { id } = params;

  return useQuery<GroupSettings>(
    route('/api/v1/group_settings/:id', { id }),
    () =>
      request('GET', endpoint('/api/v1/group_settings/:id', { id })).then(
        (response: GenericSingleResourceResponse<GroupSettings>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/group_settings/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        toast.success(`${action}d_group`);

        queryClient.invalidateQueries(
          route('/api/v1/group_settings/:id', { id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.error();
      });
  };
}
