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
import { Card } from '$app/components/cards';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { Spinner } from '$app/components/Spinner';
import { useDocuNinjaUserQuery } from '$app/common/queries/docuninja/users';
import { Default } from '$app/components/layouts/Default';
import { route } from '$app/common/helpers/route';
import { useColorScheme } from '$app/common/colors';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks/useActions';
import { useSocketEvent } from '$app/common/queries/sockets';
import { TabGroup } from '$app/components/TabGroup';
import Permissions from '../common/components/Permissions';
import Details from '../common/components/Details';
import { Permission as PermissionType } from '$app/common/interfaces/docuninja/api';
import { Notifications } from '../common/components/Notifications';

function Create() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const actions = useActions();

  const pages = [
    {
      name: t('users'),
      href: '/documents/users',
    },
    {
      name: t('edit_user'),
      href: route('/documents/users/:id/edit', { id }),
    },
  ];

  const [user, setUser] = useState<User>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const [notifications, setNotifications] = useState<Record<string, string>>(
    {}
  );
  const [allNotificationsValue, setAllNotificationsValue] =
    useState<string>('none');

  const { data: userResponse, isLoading } = useDocuNinjaUserQuery({
    id,
  });

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

  const handleUpdate = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request(
        'PUT',
        docuNinjaEndpoint('/api/users/:id', {
          id,
        }),
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
        .then(() => {
          toast.success('updated_user');

          $refetch(['docuninja_users']);
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
    if (userResponse) {
      setUser(userResponse);
    }
  }, [userResponse]);

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

  useSocketEvent({
    on: ['App\\Events\\User\\UserWasVerified'],
    callback: () => $refetch(['docuninja_users']),
  });

  return (
    <Default
      title={t('edit_user')}
      breadcrumbs={pages}
      navigationTopRight={
        <ResourceActions
          resource={user}
          actions={actions}
          disableSaveButton={isFormBusy || !user}
          saveButtonLabel={t('save')}
          onSaveClick={handleUpdate}
        />
      }
    >
      {!isLoading && user ? (
        <div className="space-y-4">
          <Card
            title={t('edit_user')}
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
              <div className="py-4">
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
                  editPage
                />
              </div>

              <div className="py-4">
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

              <div className="py-4">
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

export default Create;
