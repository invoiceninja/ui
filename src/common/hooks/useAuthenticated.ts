/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { refreshCompanyUsers } from '$app/common/queries/refresh';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { AppDispatch, RootState } from '../stores/store';

export function useAuthenticated(): boolean {
  const user = useSelector((state: RootState) => state.user);
  const token = localStorage.getItem('X-NINJA-TOKEN');

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  if (token === null) {
    return false;
  }

  if (user.authenticated) {
    return true;
  }

  refreshCompanyUsers(queryClient, dispatch).catch((e) => {
    console.error(e);

    localStorage.removeItem('X-NINJA-TOKEN');

    navigate('/login');
  });

  return true;
}
