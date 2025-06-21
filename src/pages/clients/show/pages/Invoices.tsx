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
import { useSetAtom } from 'jotai';
import {
  ConfirmActionModal,
  confirmActionModalAtom,
} from '$app/pages/recurring-invoices/common/components/ConfirmActionModal';
import { useState } from 'react';
import { useBulk } from '$app/common/queries/invoices';
import { useTranslation } from 'react-i18next';

export default function Invoices() {
  const [t] = useTranslation();

  const { id } = useParams();

  const deselectAll = () => {
    setSelectedInvoiceIds([]);
  };

  const bulk = useBulk({
    onSuccess: deselectAll,
  });
  const hasPermission = useHasPermission();

  const actions = useActions();
  const columns = useInvoiceColumns();
  const { footerColumns } = useFooterColumns();
  const customBulkActions = useCustomBulkActions();

  const setIsConfirmActionModalOpen = useSetAtom(confirmActionModalAtom);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  return (
    <>
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
        onDeleteBulkAction={(selected) => {
          setSelectedInvoiceIds(selected);
          setIsConfirmActionModalOpen(true);
        }}
      />

      <ConfirmActionModal
        title={t('delete_invoices')}
        message={t('delete_invoices_confirmation')}
        disabledButton={selectedInvoiceIds.length === 0}
        onClick={() => {
          bulk(selectedInvoiceIds, 'delete');
        }}
      />
    </>
  );
}
