/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { permission } from '$app/common/guards/guards/permission';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCompanyVerifactu } from '$app/common/hooks/useCompanyVerifactu';
import { DataTable } from '$app/components/DataTable';
import { DeleteInvoicesConfirmationModal } from '$app/pages/invoices/common/components/DeleteInvoicesConfirmationModal';
import { useCustomBulkActions } from '$app/pages/invoices/common/hooks/useCustomBulkActions';
import { useFooterColumns } from '$app/pages/invoices/common/hooks/useFooterColumns';
import { useInvoiceColumns } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import { useActions } from '$app/pages/invoices/edit/components/Actions';
import { confirmActionModalAtom } from '$app/pages/recurring-invoices/common/components/ConfirmActionModal';

export default function Invoices() {
  const { id } = useParams();

  const hasPermission = useHasPermission();

  const { actions } = useActions();
  const columns = useInvoiceColumns();
  const filters = useInvoiceFilters();
  const { footerColumns } = useFooterColumns();
  const customBulkActions = useCustomBulkActions();

  const setIsConfirmActionModalOpen = useSetAtom(confirmActionModalAtom);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  const verifactuEnabled = useCompanyVerifactu();

  return (
    <>
      <DataTable
        resource="invoice"
        endpoint={route(
          '/api/v1/invoices?include=client.group_settings,project&client_id=:id&sort=id|desc',
          { id }
        )}
        columns={columns}
        footerColumns={footerColumns}
        customActions={actions}
        customBulkActions={customBulkActions}
        customFilters={filters}
        customFilterPlaceholder="status"
        withResourcefulActions
        withoutDefaultBulkActions
        bulkRoute="/api/v1/invoices/bulk"
        linkToCreate={route('/invoices/create?client=:id', { id })}
        linkToEdit="/invoices/:id/edit"
        excludeColumns={['client_id']}
        linkToCreateGuards={[permission('create_invoice')]}
        hideEditableOptions={!hasPermission('edit_invoice')}
        onDeleteBulkAction={(selected) => {
          setSelectedInvoiceIds(selected);
          setIsConfirmActionModalOpen(true);
        }}
        withoutPageAsPreference
        showDelete={(invoice) =>
          Boolean(!verifactuEnabled) ||
          (verifactuEnabled && invoice.status_id === InvoiceStatus.Draft)
        }
        showRestore={(invoice) =>
          Boolean(!verifactuEnabled) ||
          (verifactuEnabled && invoice.status_id === InvoiceStatus.Draft)
        }
        withoutStoringSearchFilter
      />

      <DeleteInvoicesConfirmationModal
        selectedInvoiceIds={selectedInvoiceIds}
        setSelectedInvoiceIds={setSelectedInvoiceIds}
      />
    </>
  );
}
