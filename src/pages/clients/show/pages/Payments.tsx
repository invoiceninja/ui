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
import { Payment } from '$app/common/interfaces/payment';
import { usePaymentColumns } from '$app/pages/payments/common/hooks/usePaymentColumns';

export default function Payments() {
  const { id } = useParams();

  const columns = usePaymentColumns();

  return (
    <DataTable
      resource="payment"
      endpoint={route(
        '/api/v1/payments?include=client,invoices&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/payments/bulk"
      linkToCreate={route('/payments/create?client=:id', { id: id })}
      showRestore={(resource: Payment) => !resource.is_deleted}
      staleTime={dataTableStaleTime}
    />
  );
}
