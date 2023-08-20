/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { injectInChanges } from '../stores/slices/user';
import { useCurrentUser } from './useCurrentUser';
import { RootState } from '../stores/store';
import { User } from '../interfaces/user';

export function useUserChanges() {
  return useSelector((state: RootState) => state.user.changes) as
    | User
    | undefined;
}

export function useInjectUserChanges() {
  const user = useCurrentUser();
  const dispatch = useDispatch();
  const changes = useUserChanges();

  useEffect(() => {
    dispatch(injectInChanges());
  }, [user]);

  return changes;
}
