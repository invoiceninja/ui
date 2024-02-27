/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { DataTable } from '$app/components/DataTable';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useDocumentColumns } from '../hooks/useDocumentColumns';

export interface Document {
  archived_at: number;
  assigned_user_id: string;
  created_at: number;
  disk: string;
  hash: string;
  height: number;
  id: string;
  is_default: boolean;
  is_deleted: boolean;
  is_public: boolean;
  name: string;
  preview: string;
  project_id: string;
  size: number;
  type: string;
  updated_at: number;
  url: string;
  user_id: string;
  vendor_id: string;
  width: number;
}
export default function Documents() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const columns = useDocumentColumns();

  const { data: latestVersion } = useQuery({
    queryKey: route('/api/v1/clients/:id/documents', { id }),
    queryFn: () =>
      request('POST', endpoint('/api/v1/clients/:id/documents', { id })).then(
        (response) => response.data
      ),
    staleTime: Infinity,
  });

  console.log(latestVersion);

  return (
    <>
      <DataTable
        resource="document"
        endpoint={route('/api/v1/clients/:id/documents', { id })}
        columns={columns}
        //customFilters={filters}
        //customActions={actions}
        customFilterPlaceholder="status"
        withResourcefulActions
        bulkRoute="/api/v1/expenses/bulk"
        hideEditableOptions={!hasPermission('edit_expense')}
      />
    </>
  );
}
