/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { Permissions } from 'common/hooks/permissions/useHasPermission';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { GuardContext } from '../Guard';

interface AssignedOptions {
  endpoint: string;
  permissions?: Permissions[];
}

export function assigned(options: AssignedOptions) {
  return async ({ params, queryClient, user, companyUser }: GuardContext) => {
    const { id } = params;
    const path = route(options.endpoint, { id });
    const results: boolean[] = [];

    if (options.permissions) {
      const companyUserPermissions = companyUser?.permissions ?? '';

      options.permissions.map((permission) =>
        results.push(companyUserPermissions.includes(permission))
      );
    }

    const response: GenericSingleResourceResponse<any> =
      await queryClient.fetchQuery(path, async () =>
        request('GET', endpoint(path))
      );

    if (
      response.data.data.user_id === user?.id ||
      response.data.data.assigned_user_id === user?.id
    ) {
      results.push(true);
    }

    return Boolean(results.filter((value) => value === true).length);
  };
}
