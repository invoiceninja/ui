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
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { useTransactionRuleColumns } from './hooks/useTransactionRuleColumns';

export function TransactionRules() {
  useTitle('bank_accounts');

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
      title={t('transaction_rules')}
      breadcrumbs={pages}
      docsLink="/docs/advanced-settings/#transaction_rules"
    >
      <DataTable
        resource="transaction_rule"
        columns={columns}
        endpoint="/api/v1/bank_transaction_rules"
        linkToCreate="/settings/bank_accounts/transaction_rules/create"
        linkToEdit="/settings/bank_accounts/transaction_rules/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
