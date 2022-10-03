/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { User } from 'common/interfaces/user';
import { useUserQuery } from 'common/queries/users';
import { Alert } from 'components/Alert';
import { Settings } from 'components/layouts/Settings';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { Actions } from './components/Actions';
import { Details } from './components/Details';
import { Notifications } from './components/Notifications';
import { Permissions } from './components/Permissions';

export function Edit() {
  const [passwordValidated, setPasswordValidated] = useState(false);

  const { id } = useParams();

  const { data: response } = useUserQuery({
    id: id!,
    enabled: passwordValidated,
  });

  const [user, setUser] = useState<User>();
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_management'), href: '/settings/users' },
    {
      name: t('edit_user'),
      href: route('/settings/users/:id/edit', { id }),
    },
  ];

  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (response?.data.data && response.data.data.email === currentUser.email) {
      navigate('/settings/user_details');
    } else {
      setUser(response?.data.data);
    }
  }, [response?.data.data]);

  const onSave = () => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/users/:id?include=company_user', { id }),
      user
    )
      .then(() => {
        toast.success(t('updated_user'));

        queryClient.invalidateQueries(route('/api/v1/users/:id', { id }));
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'));
      });
  };

  const onPasswordSave = (password: string) => {
    toast.processing();

    queryClient
      .fetchQuery(generatePath('/api/v1/users/:id', { id: id! }), () =>
        request(
          'GET',
          endpoint('/api/v1/users/:id', { id: id! }),
          {},
          { headers: { 'X-Api-Password': password } }
        )
      )
      .then(() => {
        setPasswordValidated(true);
        toast.dismiss();
      })
      .catch((error: AxiosError) => {
        error.response?.status === 412
          ? toast.error('password_error_incorrect')
          : toast.error();
      });
  };

  return (
    <Settings
      breadcrumbs={pages}
      title={t('edit_user')}
      onSaveClick={onSave}
      navigationTopRight={user && <Actions user={user} />}
    >
      <PasswordConfirmation
        show={!passwordValidated}
        onSave={onPasswordSave}
        onClose={setPasswordValidated}
      />

      {user && user.email_verified_at === null && (
        <Alert type="warning">{t('email_sent_to_confirm_email')}.</Alert>
      )}

      {user && <Details user={user} setUser={setUser} />}
      {user && <Notifications user={user} setUser={setUser} />}
      {user && <Permissions user={user} setUser={setUser} />}
    </Settings>
  );
}
