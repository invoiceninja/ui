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
import { useTransactionColumns } from '../common/hooks/useTransactionColumns';

export function Transactions() {
  useTitle('transactions');

  const [t] = useTranslation();

  const columns = useTransactionColumns();

  const pages = [{ name: t('transactions'), href: '/transactions' }];

  return (
    <Default
      title={t('transactions')}
      breadcrumbs={pages}
      docsLink="docs/transactions/"
    >
      <DataTable
        resource="transaction"
        endpoint="/api/v1/bank_transactions"
        columns={columns}
        linkToCreate="/transactions/create"
        linkToEdit="/transactions/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
