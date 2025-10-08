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
import { useNavigate } from 'react-router-dom';
import { DataTable } from '$app/components/DataTable';
import { User } from '$app/common/interfaces/docuninja/api';
import { useUserColumns } from './common/hooks/useUserColumns';
import { Default } from '$app/components/layouts/Default';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { NumberOfUsersAlert } from './common/components/NumberOfUsersAlert';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';
import { useUsersQuery as useDocuNinjaUsersQuery } from '$app/common/queries/docuninja/users';

export default function Users() {
  useTitle('users');

  const [t] = useTranslation();
  const navigate = useNavigate();

  const columns = useUserColumns();

  // Get DocuNinja data from unified atoms (NO QUERY!)
  const [docuData] = useAtom(docuNinjaAtom);
  const docuAccount = docuData?.account;
  const { getToken } = useDocuNinjaActions();
  
  // Get actual DocuNinja users count from API
  const { data: docuNinjaUsersData } = useDocuNinjaUsersQuery({ 
    perPage: '1', 
    currentPage: '1', 
    filter: '' 
  });
  
  const currentUserCount = docuNinjaUsersData?.data?.meta?.total || 0;
  const maxUsers = docuAccount?.num_users || 0;

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

      <DataTable<User>
        queryIdentificator="/api/users/docuninja"
        resource="user"
        endpoint="/api/users?sort=id|desc"
        columns={columns}
        withResourcefulActions
        bulkRoute="/api/users/bulk"
        linkToCreate="/documents/users/selection"
        linkToEdit="/documents/users/:id/edit"
        useDocuNinjaApi
        endpointHeaders={{
          Authorization: `Bearer ${getToken()}`,
        }}
        totalPagesPropPath="data.meta.last_page"
        totalRecordsPropPath="data.meta.total"
        disabledCreateButton={currentUserCount >= maxUsers}
        filterParameterKey="search"
      />
    </Default>
  );
}
