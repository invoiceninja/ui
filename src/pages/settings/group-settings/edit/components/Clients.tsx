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
import { DataTable } from '$app/components/DataTable';
import { useActions } from '$app/pages/clients/common/hooks/useActions';
import { useClientColumns } from '$app/pages/clients/common/hooks/useClientColumns';
import { useCustomBulkActions } from '$app/pages/clients/common/hooks/useCustomBulkActions';
import { useParams } from 'react-router-dom';

export function Clients() {
  const { id } = useParams();

  const actions = useActions();
  const columns = useClientColumns();
  const customBulkActions = useCustomBulkActions();

  return (
    <div className="mt-8">
      <DataTable
        resource="client"
        endpoint={route('/api/v1/clients?group=:groupId&sort=id|desc', {
          groupId: id,
        })}
        bulkRoute="/api/v1/clients/bulk"
        linkToEdit="/clients/:id/edit"
        columns={columns}
        customActions={actions}
        customBulkActions={customBulkActions}
        withResourcefulActions
        linkToCreate={route('/clients/create?group=:groupId', {
          groupId: id,
        })}
      />
    </div>
  );
}
