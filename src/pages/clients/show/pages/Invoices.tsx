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

export const dataTableStaleTime = 50;

export default function Invoices() {
  const { id } = useParams();

  const columns = useInvoiceColumns();

  return (
    <DataTable
      resource="invoice"
      endpoint={route('/api/v1/invoices?client_id=:id&sort=id|desc', { id })}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/invoices/bulk"
      linkToCreate={route('/invoices/create?client=:id', { id: id })}
      staleTime={dataTableStaleTime}
    />
  );
}
