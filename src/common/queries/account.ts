/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import { endpoint } from '../helpers';
import { request } from '../helpers/request';
import { CompanyUser } from '../interfaces/company-user';
import { GenericManyResponse } from '../interfaces/generic-many-response';
import { updateAccount } from '../stores/slices/company-users';

interface Params {
  enabled: boolean;
}

export function useAccountStatusQuery({ enabled }: Params) {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['/api/v1/refresh_react', 'account_status'],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/refresh_react?current_company=true')
      ).then((response: AxiosResponse<GenericManyResponse<CompanyUser>>) => {
        const account = response.data.data[0]?.account ?? null;

        if (account) {
          dispatch(updateAccount(account));
        }

        return account;
      }),
    enabled,
    staleTime: 21600000,
  });
}
