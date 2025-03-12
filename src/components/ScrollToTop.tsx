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
import { useLocation } from 'react-router';

export function ScrollToTop(props: any) {
  const location = useLocation();

  const pathSegments = location.pathname.split('/');
  const id = pathSegments?.[2] || '';

  const isClientShowPage =
    id &&
    location.pathname.startsWith(`/clients/${id}`) &&
    !location.pathname.endsWith('/edit');

  const isVendorShowPage =
    id &&
    location.pathname.startsWith(`/vendors/${id}`) &&
    !location.pathname.endsWith('/edit');

  useEffect(() => {
    if (isClientShowPage || isVendorShowPage) {
      return;
    }

    window.scrollTo(0, 0);
  }, [location]);

  return <>{props.children}</>;
}
