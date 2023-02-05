/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { route } from 'common/helpers/route';
import { TransactionRule } from 'common/interfaces/transaction-rules';
import { DataTableColumns } from 'components/DataTable';
import { useTranslation } from 'react-i18next';

export function useTransactionRuleColumns() {
  const [t] = useTranslation();

  const columns: DataTableColumns<TransactionRule> = [
    {
      id: 'name',
      label: t('name'),
      format: (field, transactionRule) => (
        <Link
          to={route('/settings/bank_accounts/transaction_rules/:id/edit', {
            id: transactionRule?.id,
          })}
        >
          {transactionRule?.name}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (field, transactionRule) => (
        <Link
          to={route('/clients/:id/edit', {
            id: transactionRule?.client_id,
          })}
        >
          {transactionRule?.name}
        </Link>
      ),
    },
    {
      id: 'vendor_id',
      label: t('vendor'),
      format: (field, transactionRule) => (
        <Link
          to={route('/vendors/:id/edit', {
            id: transactionRule?.vendor_id,
          })}
        >
          {transactionRule?.name}
        </Link>
      ),
    },
    {
      id: 'applies_to',
      label: t('applies_to'),
    },
  ];

  return columns;
}
