/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useActions } from '../edit/components/Actions';
import {
  defaultColumns,
  useInvoiceColumns,
} from '../common/hooks/useInvoiceColumns';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { useInvoiceFilters } from '../common/hooks/useInvoiceFilters';
import { ImportButton } from 'components/import/ImportButton';
import { useAllInvoiceColumns } from '../common/hooks/useAllInvoiceColumns';

export function Invoices() {
  const { documentTitle } = useTitle('invoices');

  const [t] = useTranslation();

  const actions = useActions();

  const filters = useInvoiceFilters();

  const invoiceColumns = useAllInvoiceColumns();

  const columns = useInvoiceColumns();

  const pages = [{ name: t('invoices'), href: '/invoices' }];

  return (
    <Default title={documentTitle} breadcrumbs={pages} docsLink="docs/invoices">
      <DataTable
        resource="invoice"
        endpoint="/api/v1/invoices?include=client&without_deleted_clients=true"
        columns={columns}
        bulkRoute="/api/v1/invoices/bulk"
        linkToCreate="/invoices/create"
        linkToEdit="/invoices/:id/edit"
        withResourcefulActions
        customActions={actions}
        customFilters={filters}
        customFilterQueryKey="client_status"
        customFilterPlaceholder="status"
        rightSide={<ImportButton route="/invoices/import" />}
        leftSideChevrons={
          <DataTableColumnsPicker
            table="invoice"
            columns={invoiceColumns as unknown as string[]}
            defaultColumns={defaultColumns}
          />
        }
      />
    </Default>
  );
}
