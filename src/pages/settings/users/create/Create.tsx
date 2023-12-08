/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { endpoint, isHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { User } from '$app/common/interfaces/user';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { defaultHeaders } from '$app/common/queries/common/headers';
import { useBlankUserQuery } from '$app/common/queries/users';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { Settings } from '$app/components/layouts/Settings';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { TabGroup } from '$app/components/TabGroup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Details } from '../edit/components/Details';
import { Notifications } from '../edit/components/Notifications';
import { Permissions } from '../edit/components/Permissions';
import { useSetAtom } from 'jotai';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';
import { $refetch } from '$app/common/hooks/useRefetch';

export function Create() {
  useTitle('new_user');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_management'), href: '/settings/users' },
    { name: t('new_user'), href: '/settings/users/create' },
  ];

  const tabs: string[] = [t('details'), t('notifications'), t('permissions')];

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const { data: response } = useBlankUserQuery();
  const [user, setUser] = useState<User>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setUser({
      ...response?.data.data,
      company_user: {
        permissions: '',
        notifications: {
          email: [],
        },
        settings: {
          table_columns: [],
          report_settings: [],
          number_years_active: 1,
          include_deleted_clients: false,
          accent_color: '#2F7DC3',
        },
        is_owner: false,
        is_admin: false,
        is_locked: false,
        updated_at: +new Date(),
        archived_at: +new Date(),
        created_at: +new Date(),
        permissions_updated_at: +new Date(),
        ninja_portal_url: '',
      },
    });
  }, [response?.data.data]);

  const onSave = (password: string) => {
    toast.processing();

    setIsPasswordConfirmModalOpen(false);

    request('POST', endpoint('/api/v1/users?include=company_user'), user, {
      headers: { 'X-Api-Password': password, ...defaultHeaders() },
    })
      .then((response) => {
        toast.success('created_user');

        $refetch(['users']);

        navigate(
          route('/settings/users/:id/edit', {
            id: response.data.data.id,
          })
        );
      })
      .catch((error) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        } else if (error.response?.status === 422) {
          const errorMessages = error.response.data;

          if (errorMessages.errors.id) {
            toast.error(errorMessages.errors.id);
          } else {
            toast.dismiss();
          }

          setErrors(errorMessages);
        }
      });
  };

  return (
    <Settings
      title={t('new_user')}
      breadcrumbs={pages}
      onSaveClick={() => setIsPasswordConfirmModalOpen(true)}
      disableSaveButton={!enterprisePlan() && isHosted()}
    >
      {!enterprisePlan() && isHosted() && (
        <AdvancedSettingsPlanAlert
          message={t('add_users_not_supported') as string}
        />
      )}

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onSave={onSave}
        onClose={setIsPasswordConfirmModalOpen}
      />

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
