/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useTitle } from 'common/hooks/useTitle';
import { User } from 'common/interfaces/user';
import { useBlankUserQuery } from 'common/queries/users';
import { Settings } from 'components/layouts/Settings';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { Details } from '../edit/components/Details';
import { Notifications } from '../edit/components/Notifications';
import { Permissions } from '../edit/components/Permissions';

export function Create() {
  useTitle('new_user');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_management'), href: '/settings/users' },
    { name: t('new_user'), href: '/settings/users/create' },
  ];

  const { data: response } = useBlankUserQuery();
  const [user, setUser] = useState<User>();

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

  const onSave = () => {
    const toastId = toast.loading(t('processing'));

    request('POST', endpoint('/api/v1/users?include=company_user'), user)
      .then((response) => {
        toast.success(t('created_user'), { id: toastId });

        navigate(
          generatePath('/settings/users/:id/edit', {
            id: response.data.data.id,
          })
        );
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };

  return (
    <Settings title={t('new_user')} breadcrumbs={pages} onSaveClick={onSave}>
      {user && <Details user={user} setUser={setUser} />}
      {user && <Notifications user={user} setUser={setUser} />}
      {user && <Permissions user={user} setUser={setUser} />}
    </Settings>
  );
}
