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
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import {
  defaultColumns,
  useAllTransactionColumns,
} from './useAllTransactionColumns';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import classNames from 'classnames';

export function useTransactionColumns() {
  const { t } = useTranslation();

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
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (_, transaction) => (transaction.is_deleted ? t('yes') : t('no')),
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
                className={classNames('prose prose-sm', {
                  'prose-invert': !reactSettings?.dark_mode,
                })}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(cleanDescriptionText(value as string)),
                }}
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
