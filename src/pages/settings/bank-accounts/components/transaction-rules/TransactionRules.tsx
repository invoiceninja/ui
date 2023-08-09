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
import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { useTransactionRuleColumns } from './hooks/useTransactionRuleColumns';

export function TransactionRules() {
  const { documentTitle } = useTitle('transaction_rules');

  const [t] = useTranslation();

  const columns = useTransactionRuleColumns();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
    {
      name: t('transaction_rules'),
      href: '/settings/bank_accounts/transaction_rules',
    },
  ];

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      docsLink="/docs/advanced-settings/#bank_transaction_rules"
    >
      <DataTable
        resource="transaction_rule"
        columns={columns}
        endpoint="/api/v1/bank_transaction_rules?include=vendor,expense_category&sort=id|desc"
        bulkRoute="/api/v1/bank_transaction_rules/bulk"
        linkToCreate="/settings/bank_accounts/transaction_rules/create"
        linkToEdit="/settings/bank_accounts/transaction_rules/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
