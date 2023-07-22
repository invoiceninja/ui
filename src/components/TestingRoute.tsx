/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Navigate, Outlet } from 'react-router-dom';

export function TestingRoute() {
  const isTestEnv = import.meta.env.VITE_IS_TEST === 'true';

  return isTestEnv ? <Outlet /> : <Navigate to="/logout" />;
}
