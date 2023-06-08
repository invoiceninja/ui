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
import { CustomBulkAction, DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useActions } from '../edit/components/Actions';
import {
  defaultColumns,
  useAllInvoiceColumns,
  useInvoiceColumns,
} from '../common/hooks/useInvoiceColumns';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { useInvoiceFilters } from '../common/hooks/useInvoiceFilters';
import { ImportButton } from '$app/components/import/ImportButton';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdPrint } from 'react-icons/md';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { Guard } from '$app/common/guards/Guard';
import { permission } from '$app/common/guards/guards/permission';
import { or } from '$app/common/guards/guards/or';

export default function Invoices() {
  const { documentTitle } = useTitle('invoices');

  const [t] = useTranslation();

  const actions = useActions();

  const filters = useInvoiceFilters();

  const printPdf = usePrintPdf({ entity: 'invoice' });

  const invoiceColumns = useAllInvoiceColumns();

  const columns = useInvoiceColumns();

  const pages = [{ name: t('invoices'), href: '/invoices' }];

  const customBulkActions: CustomBulkAction[] = [
    (selectedIds) => (
      <DropdownElement
        onClick={() => printPdf(selectedIds)}
        icon={<Icon element={MdPrint} />}
      >
        {t('print_pdf')}
      </DropdownElement>
    ),
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      docsLink="en/invoices"
      withoutBackButton
    >
      <DataTable
        resource="invoice"
        endpoint="/api/v1/invoices?include=client&without_deleted_clients=true&sort=id|desc"
        columns={columns}
        bulkRoute="/api/v1/invoices/bulk"
        linkToCreate="/invoices/create"
        linkToEdit="/invoices/:id/edit"
        withResourcefulActions
        customActions={actions}
        customBulkActions={customBulkActions}
        customFilters={filters}
        customFilterQueryKey="client_status"
        customFilterPlaceholder="status"
        rightSide={
          <Guard
            type="component"
            component={<ImportButton route="/invoices/import" />}
            guards={[
              or(permission('create_invoice'), permission('edit_invoice')),
            ]}
          />
        }
        leftSideChevrons={
          <DataTableColumnsPicker
            table="invoice"
            columns={invoiceColumns as unknown as string[]}
            defaultColumns={defaultColumns}
          />
        }
        linkToCreateGuards={[permission('create_invoice')]}
      />
    </Default>
  );
}
