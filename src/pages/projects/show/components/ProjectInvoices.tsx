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
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCompanyVerifactu } from '$app/common/hooks/useCompanyVerifactu';
import { Project } from '$app/common/interfaces/project';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { DeleteInvoicesConfirmationModal } from '$app/pages/invoices/common/components/DeleteInvoicesConfirmationModal';
import { useCustomBulkActions } from '$app/pages/invoices/common/hooks/useCustomBulkActions';
import { useFooterColumns } from '$app/pages/invoices/common/hooks/useFooterColumns';
import {
  defaultColumns,
  useAllInvoiceColumns,
  useInvoiceColumns,
} from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import { useActions } from '$app/pages/invoices/edit/components/Actions';
import { confirmActionModalAtom } from '$app/pages/recurring-invoices/common/components/ConfirmActionModal';
import { ModuleBitmask } from '$app/pages/settings';

interface Props {
  project: Project;
}

export const useShowProjectInvoices = () => {
  const enabled = useEnabled();
  const hasPermission = useHasPermission();

  return (
    enabled(ModuleBitmask.Invoices) &&
    (hasPermission('view_invoice') || hasPermission('edit_invoice'))
  );
};

export function ProjectInvoices({ project }: Props) {
  const hasPermission = useHasPermission();
  const showInvoices = useShowProjectInvoices();

  const { actions, modal } = useActions();
  const filters = useInvoiceFilters();
  const columns = useInvoiceColumns();
  const invoiceColumns = useAllInvoiceColumns();
  const verifactuEnabled = useCompanyVerifactu();
  const { footerColumns } = useFooterColumns();
  const customBulkActions = useCustomBulkActions();

  const setIsConfirmActionModalOpen = useSetAtom(confirmActionModalAtom);

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  if (!showInvoices) {
    return null;
  }

  return (
    <>
      <DataTable
        resource="invoice"
        columns={columns}
        footerColumns={footerColumns}
        customActions={actions}
        endpoint={`/api/v1/invoices?include=client.group_settings,project&without_deleted_clients=true&sort=id|desc&project_id=${project.id}`}
        bulkRoute="/api/v1/invoices/bulk"
        linkToEdit="/invoices/:id/edit"
        customFilters={filters}
        customBulkActions={customBulkActions}
        customFilterPlaceholder="status"
        withResourcefulActions
        withoutDefaultBulkActions
        onDeleteBulkAction={(selected) => {
          setSelectedInvoiceIds(selected);
          setIsConfirmActionModalOpen(true);
        }}
        showDelete={(invoice) =>
          !verifactuEnabled || invoice.status_id === InvoiceStatus.Draft
        }
        showRestore={(invoice) =>
          !verifactuEnabled || invoice.status_id === InvoiceStatus.Draft
        }
        rightSide={
          <DataTableColumnsPicker
            columns={invoiceColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="invoice"
          />
        }
        hideEditableOptions={!hasPermission('edit_invoice')}
      />

      <DeleteInvoicesConfirmationModal
        selectedInvoiceIds={selectedInvoiceIds}
        setSelectedInvoiceIds={setSelectedInvoiceIds}
      />

      {modal}
    </>
  );
}
