/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AuthenticationTypes } from '$app/common/dtos/authentication';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  changeCurrentIndex,
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { authenticate } from '$app/common/stores/slices/user';
import { AppDispatch } from '$app/common/stores/store';
import dayjs from 'dayjs';
import { QueryClient } from 'react-query';

export const REFRESH_QUERY_KEY = '/api/v1/refresh';

const resolveCurrentIndex = (companyUsers: CompanyUser[]) => {
  const storedIndex = localStorage.getItem('X-CURRENT-INDEX');

  const currentIndex = storedIndex
    ? parseInt(storedIndex)
    : companyUsers.findIndex(
        (companyUser) =>
          companyUser.company.id === companyUsers[0].account.default_company_id
      );

  return currentIndex === -1 ? 0 : currentIndex;
};

export const applyCompanyUsers = (
  dispatch: AppDispatch,
  companyUsers: CompanyUser[]
) => {
  const currentIndex = resolveCurrentIndex(companyUsers);

  dispatch(
    authenticate({
      type: AuthenticationTypes.TOKEN,
      user: companyUsers[currentIndex].user,
      token: localStorage.getItem('X-NINJA-TOKEN') as string,
    })
  );

  dispatch(updateCompanyUsers(companyUsers));
  dispatch(resetChanges('company'));
  dispatch(changeCurrentIndex(currentIndex));
};

export const restoreCompanyUsers = (
  queryClient: QueryClient,
  dispatch: AppDispatch
) => {
  const companyUsers =
    queryClient.getQueryData<CompanyUser[]>(REFRESH_QUERY_KEY);

  if (!companyUsers?.length || !localStorage.getItem('X-NINJA-TOKEN')) {
    return false;
  }

  applyCompanyUsers(dispatch, companyUsers);

  return true;
};

export const refreshCompanyUsers = (
  queryClient: QueryClient,
  dispatch: AppDispatch
) => {
  return queryClient
    .fetchQuery(REFRESH_QUERY_KEY, () => {
      return request(
        'POST',
        endpoint('/api/v1/refresh?updated_at=:updatedAt', {
          updatedAt: dayjs().unix(),
        })
      ).then((response) => response.data.data as CompanyUser[]);
    })
    .then((companyUsers) => {
      applyCompanyUsers(dispatch, companyUsers);

      queryClient.invalidateQueries(['/api/docuninja/login']);
    });
};
