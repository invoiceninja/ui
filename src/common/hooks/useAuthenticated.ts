/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { resolveCompanyIndex } from '$app/common/helpers/company-index';
import { request } from '$app/common/helpers/request';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  changeCurrentIndex,
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
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
  // Reads the search under BrowserRouter and the in-fragment search under
  // HashRouter, so one call covers both router modes.
  const [searchParams] = useSearchParams();

  if (token === null) {
    return false;
  }

  if (user.authenticated) {
    return true;
  }

  queryClient
    .fetchQuery({
      queryKey: ['/api/v1/refresh'],
      queryFn: () =>
        request(
          'POST',
          endpoint('/api/v1/refresh?updated_at=:updatedAt', {
            updatedAt: dayjs().unix(),
          })
        ).then((response) => {
          const companyUsers: CompanyUser[] = response.data.data;

          const { index: currentIndex, fromUrl } = resolveCompanyIndex({
            companyUsers,
            requestedCompanyId: searchParams.get('company'),
            storedIndex: localStorage.getItem('X-CURRENT-INDEX'),
          });

          // Persist only when the URL chose it, exactly as the company switcher
          // does, so a later in-app navigation stays in that workspace.
          if (fromUrl) {
            localStorage.setItem('X-CURRENT-INDEX', currentIndex.toString());
          }

          dispatch(
            authenticate({
              type: AuthenticationTypes.TOKEN,
              user: response.data.data[currentIndex].user,
              token: localStorage.getItem('X-NINJA-TOKEN') as string,
            })
          );

          dispatch(updateCompanyUsers(response.data.data));
          dispatch(resetChanges('company'));
          dispatch(changeCurrentIndex(currentIndex));

          // Trigger DocuNinja data fetch after successful refresh
          queryClient.invalidateQueries({
            queryKey: ['/api/docuninja/login'],
          });

          return response;
        }),
    })
    .catch((e) => {
      console.error(e);

      localStorage.removeItem('X-NINJA-TOKEN');

      navigate('/login');
    });

  return true;
}
