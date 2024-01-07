/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { useTitle } from '$app/common/hooks/useTitle';
import { User } from '$app/common/interfaces/user';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { useState } from 'react';
import { useBulk } from '$app/common/queries/users';

export function Users() {
  useTitle('user_management');

  const currentUser = useCurrentUser();

  const [t] = useTranslation();

  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);
  const [action, setAction] = useState<'archive' | 'restore' | 'delete'>();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const bulk = useBulk();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_management'), href: '/settings/users' },
  ];

  const columns: DataTableColumns<User> = [
    {
      id: 'name',
      label: 'name',
      format: (field, resource) => (
        <Link to={route('/settings/users/:id/edit', { id: resource.id })}>
          {resource.first_name} {resource.last_name}
        </Link>
      ),
    },
    { id: 'email', label: 'email' },
  ];

  return (
    <>
      <Settings
        title={t('user_details')}
        breadcrumbs={pages}
        docsLink="/docs/advanced-settings/#user_management"
        withoutBackButton
      >
        <DataTable
          resource="user"
          columns={columns}
          endpoint={route(
            '/api/v1/users?hideOwnerUsers=true&without=:userId&sort=id|desc&status=active',
            {
              userId: currentUser?.id,
            }
          )}
          linkToCreate="/settings/users/create"
          bulkRoute="/api/v1/users/bulk"
          onBulkActionCall={(selectedUserIds, action) => {
            setSelectedUserIds(selectedUserIds);
            setAction(action);
            setIsPasswordConfirmModalOpen(true);
          }}
        />
      </Settings>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={(password) => action && bulk(selectedUserIds, action, password)}
        tableActions
      />
    </>
  );
}
