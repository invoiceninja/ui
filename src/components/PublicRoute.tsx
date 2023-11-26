/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Navigate, Outlet } from 'react-router';
import { useAuthenticated } from '../common/hooks/useAuthenticated';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export function PublicRoute() {
  const authenticated = useAuthenticated();
  const hasPermission = useHasPermission();

  return authenticated ? (
    <Navigate
      to={
        hasPermission('view_dashboard')
          ? '/dashboard'
          : '/settings/user_details'
      }
    />
  ) : (
    <Outlet />
  );
}
