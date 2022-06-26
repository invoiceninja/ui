/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useUserQuery } from 'common/queries/users';
import { Settings } from 'components/layouts/Settings';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function Edit() {
  const { id } = useParams();
  const { data: user } = useUserQuery({ id });
  const currentUser = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.data.data && user.data.data.email === currentUser.email) {
      navigate('/settings/user_details');
    }
  }, [user?.data.data]);

  return <Settings>Single edit page for user</Settings>;
}
