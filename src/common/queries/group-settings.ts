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
import { useQuery } from 'react-query';
import { useAdmin } from '../hooks/permissions/useHasPermission';
import { GroupSettings } from '../interfaces/group-settings';
import { GenericSingleResourceResponse } from '../interfaces/generic-api-response';

export function useGroupSettingsQuery() {
  return useQuery('/api/v1/group_settings', () => {
    return request('GET', endpoint('/api/v1/group_settings'));
  });
}

export function useBlankGroupSettingsQuery() {
  const { isAdmin } = useAdmin();

  return useQuery<GroupSettings>(
    '/api/v1/group_settings/create',
    () =>
      request('GET', endpoint('/api/v1/group_settings/create')).then(
        (response: GenericSingleResourceResponse<GroupSettings>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: isAdmin }
  );
}
