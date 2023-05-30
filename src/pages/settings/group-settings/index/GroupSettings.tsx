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
import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { GroupSettings as GroupSettingsEntity } from '$app/common/interfaces/group-settings';
import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';

export function GroupSettings() {
  const { documentTitle } = useTitle('online_payments');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('group_settings'), href: '/settings/group_settings' },
  ];

  const columns: DataTableColumns<GroupSettingsEntity> = [
    {
      id: 'name',
      label: t('name'),
      format: (field, resource) => (
        <Link to={route('/settings/gateways/:id/edit', { id: resource.id })}>
          {field}
        </Link>
      ),
    },
  ];

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      docsLink="en/advanced-settings/#group_settings"
    >
      <DataTable
        columns={columns}
        resource="group"
        endpoint="/api/v1/group_settings?sort=id|desc"
        bulkRoute="/api/v1/group_settings/bulk"
        linkToCreate="/settings/group_settings/create"
        linkToEdit="/settings/group_settings/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
