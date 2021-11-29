/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthenticated } from '../common/hooks/useAuthenticated';
import { RootState } from '../common/stores/store';
import { LoadingScreen } from './LoadingScreen';

export function PrivateRoute() {
  const authenticated = useAuthenticated();
  const user = useSelector((state: RootState) => state.user);

  return authenticated ? (
    user.user.id ? (
      <Outlet />
    ) : (
      <LoadingScreen />
    )
  ) : (
    <Navigate to="/login" />
  );
}
