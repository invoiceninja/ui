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
import { useQueryClient } from 'react-query';

export function Logout() {
  const queryClient = useQueryClient();

  // const { signOut } = useGoogleLogout({
  //   clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  // });

  useEffect(() => {
    // if (isHosted() && user?.oauth_provider_id === 'microsoft' && msal) {
    //   msal.logoutPopup();
    // }

    // if (isHosted() && user?.oauth_provider_id === 'google') {
    //   // signOut();
    // }

    localStorage.clear();
    sessionStorage.clear();

    queryClient.invalidateQueries();
    queryClient.removeQueries();

    window.location.href = '/';
  }, []);

  return <></>;
}
