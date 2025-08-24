/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { User } from '$app/common/interfaces/docuninja/api';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { route } from '$app/common/helpers/route';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '$app/components/Spinner';
import { useBlankDocuNinjaUserQuery } from '$app/common/queries/docuninja/users';
import { Default } from '$app/components/layouts/Default';
import { TabGroup } from '$app/components/TabGroup';
import Permissions from '../common/components/Permissions';
import Details from '../common/components/Details';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { Permission as PermissionType } from '$app/common/interfaces/docuninja/api';
import { Notifications } from '../common/components/Notifications';

export default function Create() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const navigate = useNavigate();

  const pages = [
    {
      name: t('users'),
      href: '/documents/users',
    },
    {
      name: t('new_user'),
      href: '/documents/users/create',
    },
  ];

  const [user, setUser] = useState<User>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(
    user?.company_user?.is_admin ?? false
  );
  const [permissions, setPermissions] = useState<PermissionType[]>(
    user?.permissions ?? []
  );
  const [notifications, setNotifications] = useState<Record<string, string>>(
    {}
  );
  const [allNotificationsValue, setAllNotificationsValue] =
    useState<string>('none');

  const { data: blankUser, isLoading } = useBlankDocuNinjaUserQuery();

  const adjustNotificationsForPayload = (): string[] => {
    let notificationArray: string[] = [];

    if (
      allNotificationsValue === 'all' ||
      allNotificationsValue === 'all_user'
    ) {
      notificationArray = [allNotificationsValue];
    } else {
      notificationArray = Object.entries(notifications)
        .filter(([id, value]) => {
          if (!value || value === 'none') return false;

          return typeof id === 'string' && id.length > 0;
        })
        .map(([id, value]) => {
          if (value === 'all') {
            return id;
          }
          if (value === 'all_user') {
            return `${id}_user`;
          }
          return id;
        });
    }

    return notificationArray;
  };

  const handleCreate = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request(
        'POST',
        docuNinjaEndpoint('/api/users'),
        {
          ...user,
          is_admin: isAdmin,
          permissions: isAdmin ? [] : permissions,
          company_user: {
            ...user?.company_user,
            notifications: adjustNotificationsForPayload(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then((response: GenericSingleResourceResponse<User>) => {
          toast.success('created_user');

          $refetch(['docuninja_users']);

          setUser(cloneDeep(blankUser));

          navigate(
            route('/documents/users/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (blankUser) {
      setUser(blankUser);
    }
  }, [blankUser]);

  useEffect(() => {
    if (user?.company_user?.notifications) {
      setAllNotificationsValue(
        user.company_user.notifications.includes('all')
          ? 'all'
          : user.company_user.notifications.includes('all_user')
          ? 'all_user'
          : 'none'
      );
    }
  }, [user]);

  return (
    <Default
      title={t('new_user')}
      breadcrumbs={pages}
      onSaveClick={handleCreate}
      disableSaveButton={isFormBusy || !user}
    >
      {!isLoading && user ? (
        <div className="space-y-4">
          <Card
            title={t('new_user')}
            className="shadow-sm"
            style={{ borderColor: colors.$24 }}
            withoutBodyPadding
            withoutHeaderBorder
          >
            <TabGroup
              tabs={[t('user_details'), t('notifications'), t('permissions')]}
              withHorizontalPadding
              horizontalPaddingWidth="1.5rem"
              fullRightPadding
            >
              <div className="pb-4">
                <Details
                  user={user}
                  setUser={setUser}
                  errors={errors}
                  isFormBusy={isFormBusy}
                  isAdmin={isAdmin}
                  setIsAdmin={setIsAdmin}
                  permissions={permissions}
                  setPermissions={setPermissions}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  allNotificationsValue={allNotificationsValue}
                  setAllNotificationsValue={setAllNotificationsValue}
                />
              </div>

              <div className="pb-4">
                <Notifications
                  user={user}
                  setUser={setUser}
                  errors={errors}
                  isFormBusy={isFormBusy}
                  isAdmin={isAdmin}
                  setIsAdmin={setIsAdmin}
                  permissions={permissions}
                  setPermissions={setPermissions}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  allNotificationsValue={allNotificationsValue}
                  setAllNotificationsValue={setAllNotificationsValue}
                />
              </div>

              <div className="pb-4">
                <Permissions
                  user={user}
                  setUser={setUser}
                  errors={errors}
                  isFormBusy={isFormBusy}
                  isAdmin={isAdmin}
                  setIsAdmin={setIsAdmin}
                  permissions={permissions}
                  setPermissions={setPermissions}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  allNotificationsValue={allNotificationsValue}
                  setAllNotificationsValue={setAllNotificationsValue}
                />
              </div>
            </TabGroup>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      )}
    </Default>
  );
}
