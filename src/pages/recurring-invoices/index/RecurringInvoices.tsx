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
  recurringInvoiceColumns,
  useActions,
  useRecurringInvoiceColumns,
  useRecurringInvoiceFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';

export function RecurringInvoices() {
  useTitle('recurring_invoices');

  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
  ];

  const actions = useActions();

  const filters = useRecurringInvoiceFilters();

  const columns = useRecurringInvoiceColumns();

  return (
    <Default
      title={t('recurring_invoices')}
      breadcrumbs={pages}
      docsLink="docs/recurring-invoices/"
    >
      <DataTable
        resource="recurring_invoice"
        columns={columns}
        endpoint="/api/v1/recurring_invoices?include=client"
        linkToCreate="/recurring_invoices/create"
        linkToEdit="/recurring_invoices/:id/edit"
        bulkRoute="/api/v1/recurring_invoices/bulk"
        customActions={actions}
        customFilters={filters}
        customFilterQueryKey="client_status"
        customFilterPlaceholder="status"
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={recurringInvoiceColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="recurringInvoice"
          />
        }
      />
    </Default>
  );
}
