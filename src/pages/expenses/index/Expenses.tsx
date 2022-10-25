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
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';
import {
  defaultColumns,
  expenseColumns,
  useExpenseColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';

export function Expenses() {
  useTitle('expenses');

  const [t] = useTranslation();

  const pages = [{ name: t('expenses'), href: '/expenses' }];

  const importButton = (
    <ReactRouterLink to="/expenses/import">
      <button className="inline-flex items-center justify-center py-2 px-4 rounded text-sm text-white bg-green-500 hover:bg-green-600">
        <svg
          className="w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="3 3 20 20"
        >
          <Download />
        </svg>
        <span>{t('import')}</span>
      </button>
    </ReactRouterLink>
  );

  const columns = useExpenseColumns();

  return (
    <Default
      title={t('expenses')}
      breadcrumbs={pages}
      docsLink="docs/expenses/"
    >
      <DataTable
        resource="expense"
        endpoint="/api/v1/expenses?include=client,vendor"
        columns={columns}
        bulkRoute="/api/v1/expenses/bulk"
        linkToCreate="/expenses/create"
        linkToEdit="/expenses/:id/edit"
        withResourcefulActions
        rightSide={importButton}
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
