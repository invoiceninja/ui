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
import { useNavigate } from 'react-router';

export function Logout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // const { signOut } = useGoogleLogout({
  //   clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  // });

  useEffect(() => {
    localStorage.removeItem('X-NINJA-TOKEN');
    localStorage.removeItem('X-CURRENT-INDEX');

    // if (isHosted() && user?.oauth_provider_id === 'microsoft' && msal) {
    //   msal.logoutPopup();
    // }

    // if (isHosted() && user?.oauth_provider_id === 'google') {
    //   // signOut();
    // }

    queryClient.invalidateQueries();

    navigate('/');
  }, []);

  return <></>;
}
