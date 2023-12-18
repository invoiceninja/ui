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

export function PublicRoute() {
  const authenticated = useAuthenticated();

  return authenticated ? <Navigate to="/dashboard" /> : <Outlet />;
}
