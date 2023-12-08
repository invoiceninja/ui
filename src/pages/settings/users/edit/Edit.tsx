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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { User } from '$app/common/interfaces/user';
import { useUserQuery } from '$app/common/queries/users';
import { Alert } from '$app/components/Alert';
import { Settings } from '$app/components/layouts/Settings';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { TabGroup } from '$app/components/TabGroup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Actions } from './components/Actions';
import { Details } from './components/Details';
import { Notifications } from './components/Notifications';
import { Permissions } from './components/Permissions';
import { useSetAtom } from 'jotai';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { $refetch } from '$app/common/hooks/useRefetch';

export function Edit() {
  const [passwordValidated, setPasswordValidated] = useState(false);

  const { id } = useParams();

  const { data: response } = useUserQuery({
    id: id!,
    enabled: passwordValidated,
  });

  const [user, setUser] = useState<User>();
  const [t] = useTranslation();

  const tabs: string[] = [t('details'), t('notifications'), t('permissions')];

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

  const [errors, setErrors] = useState<ValidationBag>();

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  useEffect(() => {
    if (
      response?.data.data &&
      response.data.data.email === currentUser?.email
    ) {
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
        toast.success('updated_user');

        $refetch(['users']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      });
  };

  const onPasswordSave = (password: string) => {
    toast.processing();

    queryClient
      .fetchQuery(
        ['/api/v1/users', id],
        () =>
          request(
            'GET',
            endpoint('/api/v1/users/:id?include=company_user', { id: id! }),
            {},
            { headers: { 'X-Api-Password': password } }
          ),
        { staleTime: Infinity }
      )
      .then(() => {
        setPasswordValidated(true);
        toast.dismiss();
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        }
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

      <TabGroup tabs={tabs}>
        <div>
          {user && <Details user={user} setUser={setUser} errors={errors} />}
        </div>
        <div>{user && <Notifications user={user} setUser={setUser} />}</div>
        <div>{user && <Permissions user={user} setUser={setUser} />}</div>
      </TabGroup>
    </Settings>
  );
}
