/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuthenticated } from "../common/hooks/useAuthenticated";

export function PrivateRoute() {
  const authenticated = useAuthenticated();

  return authenticated ? <Outlet /> : <Navigate to="/login" />;
}
