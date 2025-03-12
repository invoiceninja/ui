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
import {
  useActions,
  useRecurringInvoiceColumns,
} from '$app/pages/recurring-invoices/common/hooks';
import { permission } from '$app/common/guards/guards/permission';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useFooterColumns } from '$app/pages/recurring-invoices/common/hooks/useFooterColumns';

export default function RecurringInvoices() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const actions = useActions();
  const columns = useRecurringInvoiceColumns();
  const { footerColumns } = useFooterColumns();

  return (
    <DataTable
      resource="recurring_invoice"
      endpoint={route(
        '/api/v1/recurring_invoices?include=client&client_id=:id&sort=id|desc',
        {
          id,
        }
      )}
      columns={columns}
      footerColumns={footerColumns}
      customActions={actions}
      withResourcefulActions
      bulkRoute="/api/v1/recurring_invoices/bulk"
      linkToCreate={route('/recurring_invoices/create?client=:id', {
        id,
      })}
      linkToEdit="/recurring_invoices/:id/edit"
      excludeColumns={['client_id']}
      linkToCreateGuards={[permission('create_recurring_invoice')]}
      hideEditableOptions={!hasPermission('edit_recurring_invoice')}
    />
  );
}
