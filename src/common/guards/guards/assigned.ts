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
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Guard } from '../Guard';

export function assigned(apiEndpoint: string, key = 'id'): Guard {
  return ({ params, user }) => {
    const id = params[key];
    const path = route(apiEndpoint, { id });

    return request('GET', endpoint(path))
      .then((response: GenericSingleResourceResponse<any>) => {
        if (
          response.data.data.user_id === user?.id ||
          response.data.data.assigned_user_id === user?.id
        ) {
          return Promise.resolve(true);
        }

        return Promise.resolve(false);
      })
      .catch(() => Promise.resolve(false));
  };
}
