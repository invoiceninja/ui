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
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

export default function Users() {
  useTitle('users');

  const [t] = useTranslation();

  const columns = useUserColumns();
  const company = useCurrentCompany();
  // Get DocuNinja data from unified atoms (NO QUERY!)
  const [docuData] = useAtom(docuNinjaAtom);
  const docuAccount = docuData?.account;
  const { getToken } = useDocuNinjaActions();
    
  const currentUserCount = docuData?.account?.users?.length || 1;
  // const currentUserCount = docuNinjaUsersData?.data?.meta?.total || 0;
  const maxUsers = docuAccount?.num_users || 0;

  const pages = [
    {
      name: t('docuninja'),
      href: '/docuninja',
    },
    {
      name: t('users'),
      href: '/docuninja/users',
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
        queryIdentificator="/api/users"
        resource="user"
        endpoint={`/api/users?ninjaCompanyKey=${company.company_key}`}
        columns={columns}
        withResourcefulActions
        useRestoreForDeletedResources
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
