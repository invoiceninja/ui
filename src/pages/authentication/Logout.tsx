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
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import { endpoint } from '../../common/helpers';
import { useCurrentUser } from 'common/hooks/useCurrentUser';

export function Logout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const [msalInstance, onMsalInstanceChange] = useState();
  
  useEffect(() => {
    request('POST', endpoint('/api/v1/logout'), {}).then(() => {
      localStorage.removeItem('X-NINJA-TOKEN');
      localStorage.removeItem('X-CURRENT-INDEX');

      if (user.oauth_provider_id == 'microsoft'){
          onMsalInstanceChange(msalInstance);
      }

      queryClient.invalidateQueries();

      navigate('/');
    });
  });

  return <></>;
}
