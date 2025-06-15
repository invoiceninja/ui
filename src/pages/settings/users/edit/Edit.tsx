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
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';

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

  const navigate = useNavigate();

  const colors = useColorScheme();
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

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
    if (isFormBusy) {
      return;
    }

    setIsFormBusy(true);

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
      })
      .finally(() => setIsFormBusy(false));
  };

  const onPasswordSave = (password: string, isPasswordRequired: boolean) => {
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
          onWrongPasswordEnter(isPasswordRequired);
          setPasswordValidated(false);
        }
      });
  };

  return (
    <Settings
      breadcrumbs={pages}
      title={t('edit_user')}
      onSaveClick={onSave}
      navigationTopRight={user && <Actions user={user} />}
      disableSaveButton={isFormBusy}
    >
      <PasswordConfirmation
        show={!passwordValidated}
        onSave={onPasswordSave}
        onClose={setPasswordValidated}
      />

      {user && user.email_verified_at === null && (
        <Alert type="warning">{t('email_sent_to_confirm_email')}.</Alert>
      )}

      <Card
        title={t('edit_user')}
        className="shadow-sm pb-6"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        withoutBodyPadding
        withoutHeaderBorder
      >
        <TabGroup
          tabs={tabs}
          horizontalPaddingWidth="1.5rem"
          withHorizontalPadding
          fullRightPadding
          withoutVerticalMargin
        >
          <div className="pt-4">
            {user && <Details user={user} setUser={setUser} errors={errors} />}
          </div>
          <div className="pt-4">
            {user && <Notifications user={user} setUser={setUser} />}
          </div>
          <div className="pt-4">
            {user && <Permissions user={user} setUser={setUser} />}
          </div>
        </TabGroup>
      </Card>
    </Settings>
  );
}
