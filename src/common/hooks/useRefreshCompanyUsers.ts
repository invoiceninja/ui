/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { endpoint } from '../helpers';
import { request } from '../helpers/request';
import {
  resetChanges,
  updateCompanyUsers,
} from '../stores/slices/company-users';

export function useRefreshCompanyUsers() {
  const dispatch = useDispatch();

  return async () => {
    return request(
      'POST',
      endpoint('/api/v1/refresh?updated_at=:updatedAt', {
        updatedAt: dayjs().unix(),
      })
    ).then((response) => {
      dispatch(updateCompanyUsers(response.data.data));
      dispatch(resetChanges('company'));
    });
  };
}
