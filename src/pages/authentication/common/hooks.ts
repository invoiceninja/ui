/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { AuthenticationTypes } from '$app/common/dtos/authentication';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  changeCurrentIndex,
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { authenticate } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { useQueryClient } from 'react-query';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';

export type LoginMethod = 'password' | 'totp' | 'passkey';

export interface LoginPrecheck {
  methods?: LoginMethod[];
  secret_required?: boolean;
}

export function useLoginPrecheck() {
  return (email: string) => {
    return request('POST', endpoint('/api/v1/login/precheck'), { email }).then(
      (response: AxiosResponse<LoginPrecheck>) => {
        return response.data;
      }
    );
  };
}

export function useLogin() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return (response: AxiosResponse) => {
    localStorage.removeItem('X-CURRENT-INDEX');

    let currentIndex = 0;

    const companyUsers: CompanyUser[] = response.data.data;
    const defaultCompanyId = companyUsers[0].account.default_company_id;

    currentIndex = companyUsers.findIndex(
      (companyUser) => companyUser.company.id === defaultCompanyId
    );

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    dispatch(
      authenticate({
        type: AuthenticationTypes.TOKEN,
        user: response.data.data[currentIndex].user,
        token: response.data.data[currentIndex].token.token,
      })
    );

    dispatch(updateCompanyUsers(response.data.data));
    dispatch(resetChanges('company'));
    dispatch(changeCurrentIndex(currentIndex));

    // Trigger DocuNinja data fetch after successful login
    queryClient.invalidateQueries(['/api/docuninja/login']);
  };
}
