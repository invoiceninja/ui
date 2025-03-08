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
import { DynamicLink } from '$app/components/DynamicLink';
import { Tooltip } from '$app/components/Tooltip';
import { Link } from '$app/components/forms';
import { useInvoicesQuery } from '$app/pages/invoices/common/queries';
import { EntityStatus } from '$app/pages/transactions/components/EntityStatus';
import { useTranslation } from 'react-i18next';
import { useCleanDescriptionText } from './useCleanDescription';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import {
  extractTextFromHTML,
  sanitizeHTML,
} from '$app/common/helpers/html-string';
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import {
  defaultColumns,
  useAllTransactionColumns,
} from './useAllTransactionColumns';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';

export function useTransactionColumns() {
  const { t } = useTranslation();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const reactSettings = useReactSettings();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const transactionColumns = useAllTransactionColumns();
  type TransactionColumns = (typeof transactionColumns)[number];

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

  const columns: DataTableColumnsExtended<Transaction, TransactionColumns> = [
    {
      column: 'status',
      id: 'status_id',
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
      column: 'deposit',
      id: 'deposit' as keyof Transaction,
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
      column: 'withdrawal',
      id: 'withdrawal' as keyof Transaction,
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
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'participant_name',
      id: 'participant_name',
      label: t('participant_name'),
    },
    {
      column: 'description',
      id: 'description',
      label: t('description'),
      format: (value) => (
        <Tooltip
          width="auto"
          tooltipElement={
            <div className="w-full max-h-48 overflow-auto whitespace-normal break-all">
              <article
                className="prose prose-sm"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(cleanDescriptionText(value as string)),
                }}
                style={{ color: colors.$1 }}
              />
            </div>
          }
        >
          <span>
            {extractTextFromHTML(
              sanitizeHTML(cleanDescriptionText(value as string))
            ).slice(0, 50)}
          </span>
        </Tooltip>
      ),
    },
    {
      column: 'invoices',
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
      column: 'expense',
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

  const list: string[] =
    reactSettings?.react_table_columns?.transaction || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
