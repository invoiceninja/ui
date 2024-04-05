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
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Transaction } from '$app/common/interfaces/transactions';
import { useExpensesQuery } from '$app/common/queries/expenses';
import { DataTableColumns } from '$app/components/DataTable';
import { DynamicLink } from '$app/components/DynamicLink';
import { Tooltip } from '$app/components/Tooltip';
import { Link } from '$app/components/forms';
import { useInvoicesQuery } from '$app/pages/invoices/common/queries';
import { EntityStatus } from '$app/pages/transactions/components/EntityStatus';
import { useTranslation } from 'react-i18next';
import { useCleanDescriptionText } from './useCleanDescription';

export function useTransactionColumns() {
  const { t } = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();
  const cleanDescriptionText = useCleanDescriptionText();

  const { data: invoices } = useInvoicesQuery({ perPage: 1000 });

  const { data: expenses } = useExpensesQuery({ perPage: 1000 });

  const getInvoiceNumber = (invoiceId: string) => {
    return invoices?.find((invoice) => invoice.id === invoiceId)?.number || '';
  };

  const getExpenseNumber = (expenseId: string) => {
    return expenses?.find((expense) => expense.id === expenseId)?.number || '';
  };

  const columns: DataTableColumns<Transaction> = [
    {
      id: 'status',
      label: t('status'),
      format: (_, transaction) => (
        <DynamicLink
          to={route('/transactions/:id/edit', { id: transaction.id })}
          renderSpan={disableNavigation('bank_transaction', transaction)}
        >
          <EntityStatus transaction={transaction} />
        </DynamicLink>
      ),
    },
    {
      id: 'deposit',
      label: t('deposit'),
      format: (_, transaction) => {
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
      format: (_, transaction) => {
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
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={cleanDescriptionText(value as string)}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: cleanDescriptionText(value as string),
            }}
          />
        </Tooltip>
      ),
    },
    {
      id: 'invoice_ids',
      label: t('invoices'),
      format: (value) =>
        value && (
          <div className="flex space-x-2">
            {value
              .toString()
              .split(',')
              .map((id) => (
                <Link key={id} to={route('/invoices/:id/edit', { id })}>
                  {getInvoiceNumber(id)}
                </Link>
              ))}
          </div>
        ),
    },
    {
      id: 'expense_id',
      label: t('expense'),
      format: (value) =>
        value && (
          <div className="flex space-x-2">
            {value
              .toString()
              .split(',')
              .map((id) => (
                <Link key={id} to={route('/expenses/:id/edit', { id })}>
                  {getExpenseNumber(id)}
                </Link>
              ))}
          </div>
        ),
    },
  ];

  return columns;
}
