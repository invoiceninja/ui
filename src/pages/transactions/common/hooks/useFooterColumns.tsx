/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useSumTableColumn } from '$app/common/hooks/useSumTableColumn';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { DataTableFooterColumnsExtended } from '$app/pages/invoices/common/hooks/useFooterColumns';
import { Transaction } from '$app/common/interfaces/transactions';
import { ApiTransactionType } from '$app/common/enums/transactions';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();

  const sumTableColumn = useSumTableColumn({ currencyPath: 'currency_id' });

  const columns: DataTableFooterColumnsExtended<Transaction, string> = [
    {
      column: 'deposit',
      id: 'deposit' as keyof Transaction,
      label: t('deposit'),
      format: (_, transactions) =>
        sumTableColumn(
          transactions
            .filter(
              (transaction) =>
                transaction.base_type === ApiTransactionType.Credit
            )
            .map((transaction) => transaction.amount),
          transactions.filter(
            (transaction) => transaction.base_type === ApiTransactionType.Credit
          )
        ),
    },
    {
      column: 'withdrawal',
      id: 'withdrawal' as keyof Transaction,
      label: t('withdrawal'),
      format: (_, transactions) =>
        sumTableColumn(
          transactions
            .filter(
              (transaction) =>
                transaction.base_type === ApiTransactionType.Debit
            )
            .map((transaction) => transaction.amount),
          transactions.filter(
            (transaction) => transaction.base_type === ApiTransactionType.Debit
          )
        ),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.transaction || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
