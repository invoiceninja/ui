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
import { useParams } from 'react-router-dom';
import { useInvoiceColumns } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useActions } from '$app/pages/invoices/edit/components/Actions';
import { useCustomBulkActions } from '$app/pages/invoices/common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { permission } from '$app/common/guards/guards/permission';
import { useFooterColumns } from '$app/pages/invoices/common/hooks/useFooterColumns';

export default function Invoices() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const actions = useActions();
  const columns = useInvoiceColumns();
  const customBulkActions = useCustomBulkActions();
  const { footerColumns } = useFooterColumns();

  return (
    <DataTable
      resource="invoice"
      endpoint={route(
        '/api/v1/invoices?include=client.group_settings&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      footerColumns={footerColumns}
      customActions={actions}
      customBulkActions={customBulkActions}
      withResourcefulActions
      bulkRoute="/api/v1/invoices/bulk"
      linkToCreate={route('/invoices/create?client=:id', { id })}
      linkToEdit="/invoices/:id/edit"
      excludeColumns={['client_id']}
      linkToCreateGuards={[permission('create_invoice')]}
      hideEditableOptions={!hasPermission('edit_invoice')}
    />
  );
}
