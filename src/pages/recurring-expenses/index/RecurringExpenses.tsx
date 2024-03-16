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
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllRecurringExpenseColumns,
  useRecurringExpenseColumns,
} from '../common/hooks';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useFooterColumns } from '../common/hooks/useFooterColumns';
import { DataTableFooterColumnsPicker } from '$app/components/DataTableFooterColumnsPicker';

export default function RecurringExpenses() {
  useTitle('recurring_expenses');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const pages = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
  ];

  const actions = useActions();
  const columns = useRecurringExpenseColumns();
  const customBulkActions = useCustomBulkActions();
  const { footerColumns, allFooterColumns } = useFooterColumns();
  const recurringExpenseColumns = useAllRecurringExpenseColumns();

  return (
    <Default
      title={t('recurring_expenses')}
      breadcrumbs={pages}
      docsLink="en/recurring-expenses"
      withoutBackButton
    >
      <DataTable
        resource="recurring_expense"
        endpoint="/api/v1/recurring_expenses?include=client,vendor&sort=id|desc"
        columns={columns}
        footerColumns={footerColumns}
        bulkRoute="/api/v1/recurring_expenses/bulk"
        linkToCreate="/recurring_expenses/create"
        linkToEdit="/recurring_expenses/:id/edit"
        customActions={actions}
        customBulkActions={customBulkActions}
        withResourcefulActions
        leftSideChevrons={
          <div className="flex space-x-2 pr-4">
            <DataTableFooterColumnsPicker
              table="recurringExpense"
              columns={allFooterColumns}
            />

            <DataTableColumnsPicker
              columns={recurringExpenseColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="recurringExpense"
            />
          </div>
        }
        linkToCreateGuards={[permission('create_recurring_expense')]}
        hideEditableOptions={!hasPermission('edit_recurring_expense')}
      />
    </Default>
  );
}
