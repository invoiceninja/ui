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
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  expenseColumns,
  useActions,
  useExpenseColumns,
  useExpenseFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ImportButton } from '$app/components/import/ImportButton';

export function Expenses() {
  useTitle('expenses');

  const [t] = useTranslation();

  const pages = [{ name: t('expenses'), href: '/expenses' }];

  const columns = useExpenseColumns();

  const actions = useActions();

  const filters = useExpenseFilters();

  return (
    <Default title={t('expenses')} breadcrumbs={pages} docsLink="docs/expenses">
      <DataTable
        resource="expense"
        endpoint="/api/v1/expenses?include=client,vendor"
        columns={columns}
        bulkRoute="/api/v1/expenses/bulk"
        linkToCreate="/expenses/create"
        linkToEdit="/expenses/:id/edit"
        customActions={actions}
        customFilters={filters}
        customFilterQueryKey="client_status"
        customFilterPlaceholder="status"
        withResourcefulActions
        rightSide={<ImportButton route="/expenses/import" />}
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={expenseColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="expense"
          />
        }
      />
    </Default>
  );
}
