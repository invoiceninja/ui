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
import { useDispatch } from 'react-redux';
import { injectInChanges } from '../stores/slices/user';
import { useCurrentUser } from './useCurrentUser';

export function useInjectUserChanges() {
  const user = useCurrentUser();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(injectInChanges());
  }, [user]);
}
