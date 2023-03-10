/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ApiTransactionType } from '$app/common/enums/transactions';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Transaction } from '$app/common/interfaces/transactions';
import { DataTableColumns } from '$app/components/DataTable';
import { Tooltip } from '$app/components/Tooltip';
import { EntityStatus } from '$app/pages/transactions/components/EntityStatus';
import { useTranslation } from 'react-i18next';

export function useTransactionColumns() {
  const { t } = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const columns: DataTableColumns<Transaction> = [
    {
      id: 'status',
      label: t('status'),
      format: (value, transaction) => {
        return (
          <EntityStatus
            route={route('/transactions/:id/edit', { id: transaction.id })}
            status={transaction.status_id}
          />
        );
      },
    },
    {
      id: 'deposit',
      label: t('deposit'),
      format: (value, transaction) => {
        if (transaction.base_type === ApiTransactionType.Credit) {
          return formatMoney(
            transaction.amount,
            company?.settings?.country_id,
            transaction.currency_id
          );
        }
      },
    },
    {
      id: 'withdrawal',
      label: t('withdrawal'),
      format: (value, transaction) => {
        if (transaction.base_type === ApiTransactionType.Debit) {
          return formatMoney(
            transaction.amount,
            company?.settings?.country_id,
            transaction.currency_id
          );
        }
      },
    },
    { id: 'date', label: t('date') },
    {
      id: 'description',
      label: t('description'),
      format: (value) => (
        <Tooltip size="regular" truncate message={value as string}>
          <span>{value}</span>
        </Tooltip>
      ),
    },
    { id: 'invoices', label: t('invoices') },
    { id: 'expense', label: t('expense') },
  ];

  return columns;
}
