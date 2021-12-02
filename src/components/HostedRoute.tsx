/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Navigate, Outlet } from 'react-router';
import { isHosted } from '../common/helpers';

export function HostedRoute() {
  return isHosted() ? <Outlet /> : <Navigate to="/" />;
}
