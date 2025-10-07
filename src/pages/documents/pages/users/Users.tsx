/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { DataTable } from '$app/components/DataTable';
import { User } from '$app/common/interfaces/docuninja/api';
import { useUserColumns } from './common/hooks/useUserColumns';
import { Default } from '$app/components/layouts/Default';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { NumberOfUsersAlert } from './common/components/NumberOfUsersAlert';
import { useAtomValue } from 'jotai';
import { docuCompanyAccountDetailsAtom } from '../../Document';
import { useState } from 'react';
import { Button } from '$app/components/forms';
import { UserSelectionModal } from './common/components/UserSelectionModal';

export default function Users() {
  useTitle('users');

  const [t] = useTranslation();
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false);

  const columns = useUserColumns();

  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);

  const pages = [
    {
      name: t('documents'),
      href: '/documents',
    },
    {
      name: t('users'),
      href: '/documents/users',
    },
  ];

  useSocketEvent({
    on: ['App\\Events\\User\\UserWasVerified'],
    callback: () => $refetch(['docuninja_users']),
  });

  return (
    <Default title={t('users')} breadcrumbs={pages}>
      <NumberOfUsersAlert />

      <div className="mb-4">
        <Button
          onClick={() => setIsUserSelectionModalOpen(true)}
          disabled={
            (docuCompanyAccountDetails?.account?.num_users || 0) ===
            (docuCompanyAccountDetails?.account?.users || [])?.length
          }
        >
          {t('grant_docuninja_access')}
        </Button>
      </div>

      <DataTable<User>
        queryIdentificator="/api/users/docuninja"
        resource="user"
        endpoint="/api/users?sort=id|desc"
        columns={columns}
        withResourcefulActions
        bulkRoute="/api/users/bulk"
        linkToEdit="/documents/users/:id/edit"
        useDocuNinjaApi
        endpointHeaders={{
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        }}
        totalPagesPropPath="data.meta.last_page"
        totalRecordsPropPath="data.meta.total"
        filterParameterKey="search"
      />

      <UserSelectionModal
        visible={isUserSelectionModalOpen}
        onClose={() => setIsUserSelectionModalOpen(false)}
      />
    </Default>
  );
}
