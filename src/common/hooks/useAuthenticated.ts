/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { request } from '$app/common/helpers/request';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  changeCurrentIndex,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { AuthenticationTypes } from '../dtos/authentication';
import { endpoint } from '../helpers';
import { authenticate } from '../stores/slices/user';
import { RootState } from '../stores/store';

export function useAuthenticated(): boolean {
  const user = useSelector((state: RootState) => state.user);
  const token = localStorage.getItem('X-NINJA-TOKEN');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  if (token === null) {
    return false;
  }

  if (user.authenticated) {
    return true;
  }

  queryClient.fetchQuery('/api/v1/refresh', () =>
    request('POST', endpoint('/api/v1/refresh'))
      .then((response) => {
        let currentIndex = 0;

        if (localStorage.getItem('X-CURRENT-INDEX')) {
          currentIndex = parseInt(
            localStorage.getItem('X-CURRENT-INDEX') || '0'
          );
        } else {
          const companyUsers: CompanyUser[] = response.data.data;
          const defaultCompanyId = companyUsers[0].account.default_company_id;

          currentIndex =
            companyUsers.findIndex(
              (companyUser) => companyUser.company.id === defaultCompanyId
            ) || 0;
        }

        dispatch(
          authenticate({
            type: AuthenticationTypes.TOKEN,
            user: response.data.data[currentIndex].user,
            token: localStorage.getItem('X-NINJA-TOKEN') as string,
          })
        );

        dispatch(updateCompanyUsers(response.data.data));
        dispatch(changeCurrentIndex(currentIndex));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        localStorage.removeItem('X-NINJA-TOKEN');

        navigate('/login');
      })
  );

  return true;
}
