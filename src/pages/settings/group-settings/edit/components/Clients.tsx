/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Client } from '$app/common/interfaces/client';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { EntityStatus } from '$app/components/EntityStatus';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Clients() {
  const [t] = useTranslation();
  const { id } = useParams();

  const columns: DataTableColumns<Client> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (_, client) => <EntityStatus entity={client} />,
    },
    {
      id: 'display_name',
      label: t('name'),
      format: (value, client) => (
        <Link to={route('/clients/:id', { id: client.id })}>{value}</Link>
      ),
    },
  ];

  return (
    <div className="mt-8">
      <DataTable
        resource="client"
        endpoint={route('/api/v1/clients?group=:groupId&sort=id|desc', {
          groupId: id,
        })}
        bulkRoute="/api/v1/clients/bulk"
        columns={columns}
        linkToCreate={route('/clients/create?group=:groupId', {
          groupId: id,
        })}
        linkToEdit="/clients/:id/edit"
        withResourcefulActions
        withoutPagination
      />
    </div>
  );
}
