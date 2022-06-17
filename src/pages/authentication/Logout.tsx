/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from 'common/helpers/request';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import { endpoint } from '../../common/helpers';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useGoogleLogout } from 'react-google-login'
import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';

export function Logout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const msalInstance = useSelector((state: RootState) => state.user.msal);

  useEffect(() => {
    request('POST', endpoint('/api/v1/logout'), {}).then(() => {
      localStorage.removeItem('X-NINJA-TOKEN');
      localStorage.removeItem('X-CURRENT-INDEX');

      if (user.oauth_provider_id == 'microsoft'){

        if(msalInstance)
          msalInstance.logout();

      }
      else if (user.oauth_provider_id == 'google'){

        const { signOut } = useGoogleLogout({
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        })

        signOut() 

      }

      queryClient.invalidateQueries();

      navigate('/');
    });
  });

  return <></>;
}
