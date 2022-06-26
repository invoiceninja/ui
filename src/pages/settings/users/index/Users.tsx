/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { User } from 'common/interfaces/user';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function Users() {
  useTitle('user_management');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('user_management'), href: '/settings/users' },
  ];

  const columns: DataTableColumns = [
    {
      id: 'name',
      label: 'name',
      format: (field, resource: User) => (
        <Link
          to={generatePath('/settings/users/:id/edit', { id: resource.id })}
        >
          {resource.first_name} {resource.last_name}
        </Link>
      ),
    },
    { id: 'email', label: 'email' },
  ];

  return (
    <Settings
      title={t('user_details')}
      breadcrumbs={pages}
      docsLink="/docs/advanced-settings/#user_management"
    >
      <DataTable
        resource="user"
        columns={columns}
        endpoint="/api/v1/users"
        withoutActions
      />
    </Settings>
  );
}
