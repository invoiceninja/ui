/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useAllPaymentColumns,
  usePaymentColumns,
} from '../common/hooks/usePaymentColumns';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { useActions } from '../common/hooks/useActions';
import { usePaymentFilters } from '../common/hooks/usePaymentFilters';
import { Payment } from '$app/common/interfaces/payment';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export default function Payments() {
  useTitle('payments');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const pages: Page[] = [{ name: t('payments'), href: '/payments' }];

  const columns = usePaymentColumns();

  const actions = useActions();

  const paymentColumns = useAllPaymentColumns();

  const filters = usePaymentFilters();

  const customBulkActions = useCustomBulkActions();

  return (
    <Default
      title={t('payments')}
      breadcrumbs={pages}
      docsLink="en/payments/"
      withoutBackButton
    >
      <DataTable
        resource="payment"
        columns={columns}
        endpoint="/api/v1/payments?include=client,invoices&without_deleted_clients=true&sort=id|desc"
        linkToCreate="/payments/create"
        bulkRoute="/api/v1/payments/bulk"
        linkToEdit="/payments/:id/edit"
        withResourcefulActions
        customActions={actions}
        customFilters={filters}
        customBulkActions={customBulkActions}
        customFilterPlaceholder="status"
        showRestore={(resource: Payment) => !resource.is_deleted}
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={paymentColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="payment"
          />
        }
        linkToCreateGuards={[permission('create_payment')]}
        showEditEntityOptions={hasPermission('edit_payment')}
      />
    </Default>
  );
}
