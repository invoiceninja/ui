/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../common/stores/store";

export function PrivateRoute() {
  const authenticated = useSelector(
    (state: RootState) => state.user.authenticated
  );

  return authenticated ? <Outlet /> : <Navigate to="/login" />;
}
