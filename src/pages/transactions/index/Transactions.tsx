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
import { DataTableColumnsPicker } from 'components/DataTableColumnsPicker';
import { expenseColumns, useExpenseColumns } from 'pages/expenses/common/hooks';
import { defaultColumns } from 'pages/products/common/hooks';

const Transactions = () => {
  useTitle('transactions');
  const [t] = useTranslation();

  const pages = [{ name: t('transactions'), href: '/transactions' }];

  const columns = useExpenseColumns();

  return (
    <Default
      title={t('transactions')}
      breadcrumbs={pages}
      docsLink="docs/transactions/"
    >
      <DataTable
        resource="expense"
        endpoint="/api/v1/expenses?include=client,vendor"
        columns={columns}
        bulkRoute="/api/v1/expenses/bulk"
        linkToCreate="/expenses/create"
        linkToEdit="/expenses/:id/edit"
        withResourcefulActions
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
};

export default Transactions;
