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

export default function Users() {
  useTitle('users');

  const [t] = useTranslation();

  const columns = useUserColumns();

  const pages = [
    {
      name: t('documents'),
      href: '/documents',
    },
    {
      name: t('users'),
      href: '/documents/settings/users',
    },
  ];

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6">
      <DataTable<User>
        resource="user"
        endpoint="/api/users?sort=id|desc"
        columns={columns}
        withResourcefulActions
        bulkRoute="/api/users/bulk"
        linkToCreate="/documents/settings/users/create"
        linkToEdit="/documents/settings/users/:id/edit"
        useDocuNinjaApi
        endpointHeaders={{
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        }}
        totalPagesPropPath="data.meta.last_page"
        totalRecordsPropPath="data.meta.total"
      />
    </div>
  );
}
