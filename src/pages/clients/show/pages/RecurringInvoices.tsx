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
import { dataTableStaleTime } from './Invoices';
import { useRecurringInvoiceColumns } from '$app/pages/recurring-invoices/common/hooks';

export default function RecurringInvoices() {
  const { id } = useParams();

  const columns = useRecurringInvoiceColumns();

  return (
    <DataTable
      resource="recurring_invoice"
      endpoint={route('/api/v1/recurring_invoices?client_id=:id&sort=id|desc', {
        id,
      })}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/recurring_invoices/bulk"
      linkToCreate={route('/recurring_invoices/create?client=:id', {
        id: id,
      })}
      staleTime={dataTableStaleTime}
    />
  );
}
