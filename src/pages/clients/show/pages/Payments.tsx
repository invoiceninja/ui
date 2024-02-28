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
import { Payment } from '$app/common/interfaces/payment';
import { usePaymentColumns } from '$app/pages/payments/common/hooks/usePaymentColumns';
import { useActions } from '$app/pages/payments/common/hooks/useActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { permission } from '$app/common/guards/guards/permission';

export default function Payments() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const columns = usePaymentColumns();

  const actions = useActions();

  return (
    <DataTable
      resource="payment"
      endpoint={route(
        '/api/v1/payments?include=client,invoices&client_id=:id&sort=id|desc',
        { id }
      )}
      columns={columns}
      customActions={actions}
      withResourcefulActions
      bulkRoute="/api/v1/payments/bulk"
      linkToCreate={route('/payments/create?client=:id', { id })}
      linkToEdit="/payments/:id/edit"
      excludeColumns={['client_id']}
      showRestore={(resource: Payment) => !resource.is_deleted}
      linkToCreateGuards={[permission('create_payment')]}
      hideEditableOptions={!hasPermission('edit_payment')}
    />
  );
}
