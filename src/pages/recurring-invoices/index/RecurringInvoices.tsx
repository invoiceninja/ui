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
import { ImportButton } from '$app/components/import/ImportButton';

import {
  defaultColumns,
  useActions,
  useAllRecurringInvoiceColumns,
  useRecurringInvoiceColumns,
  useRecurringInvoiceFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';

export default function RecurringInvoices() {
  useTitle('recurring_invoices');

  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
  ];

  const actions = useActions();

  const filters = useRecurringInvoiceFilters();

  const recurringInvoiceColumns = useAllRecurringInvoiceColumns();

  const columns = useRecurringInvoiceColumns();

  return (
    <Default
      title={t('recurring_invoices')}
      breadcrumbs={pages}
      docsLink="en/recurring-invoices/"
      withoutBackButton
    >
      <DataTable
        resource="recurring_invoice"
        columns={columns}
        endpoint="/api/v1/recurring_invoices?include=client&without_deleted_clients=true&sort=id|desc"
        linkToCreate="/recurring_invoices/create"
        linkToEdit="/recurring_invoices/:id/edit"
        bulkRoute="/api/v1/recurring_invoices/bulk"
        customActions={actions}
        customFilters={filters}
        customFilterPlaceholder="status"
        withResourcefulActions
        rightSide={
          <Guard
            type="component"
            guards={[
              or(
                permission('create_recurring_invoice'),
                permission('edit_recurring_invoice')
              ),
            ]}
            component={<ImportButton route="/recurring_invoices/import" />}
          />
        }
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={recurringInvoiceColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="recurringInvoice"
          />
        }
        linkToCreateGuards={[permission('create_recurring_invoice')]}
      />
    </Default>
  );
}
