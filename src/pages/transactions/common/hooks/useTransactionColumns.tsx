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
import { transactionStatuses } from 'common/constants/transactions';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCountries } from 'common/hooks/useCountries';
import { useCurrencies } from 'common/hooks/useCurrencies';
import { Transaction } from 'common/interfaces/transactions';
import { Badge } from 'components/Badge';
import { DataTableColumns } from 'components/DataTable';
import { useTranslation } from 'react-i18next';

export const useTransactionColumns = () => {
  const { t } = useTranslation();
  const countries = useCountries();
  const currencies = useCurrencies();
  const formatMoney = useFormatMoney();

  const getCurrencyCodeById = (currencyId: string): string => {
    return currencies?.find(({ id }) => currencyId === id)?.code || '';
  };

  const getCountryIdByCurrencyCode = (
    currencyCode: string | undefined
  ): string => {
    return (
      countries?.find(({ currency_code: code }) => code === currencyCode)?.id ||
      ''
    );
  };

  const columns: DataTableColumns<Transaction> = [
    {
      id: 'status',
      label: t('status'),
      format: (value, transaction) => {
        const transactionStatusKey =
          transactionStatuses?.find(({ id }) => id === transaction?.status_id)
            ?.key || '';
        if (transactionStatusKey === 'unmatched') {
          return (
            <Link to={route('/transactions/:id/edit', { id: transaction.id })}>
              <Badge variant="generic">{t(transactionStatusKey)}</Badge>
            </Link>
          );
        }
        if (transactionStatusKey === 'matched') {
          return (
            <Link to={route('/transactions/:id/edit', { id: transaction.id })}>
              <Badge variant="dark-blue">{t(transactionStatusKey)}</Badge>
            </Link>
          );
        }
        return (
          <Link to={route('/transactions/:id/edit', { id: transaction.id })}>
            <Badge variant="green">{t(transactionStatusKey)}</Badge>
          </Link>
        );
      },
    },
    {
      id: 'deposit',
      label: t('deposit'),
      format: (value, transaction) => {
        const countryId = getCountryIdByCurrencyCode(
          getCurrencyCodeById(transaction?.currency_id)
        );
        if (transaction?.base_type === 'CREDIT') {
          return formatMoney(
            transaction?.amount,
            countryId,
            transaction?.currency_id
          );
        }
      },
    },
    {
      id: 'withdrawal',
      label: t('withdrawal'),
      format: (value, transaction) => {
        const countryId = getCountryIdByCurrencyCode(
          getCurrencyCodeById(transaction?.currency_id)
        );
        if (transaction?.base_type === 'DEBIT') {
          return formatMoney(
            transaction?.amount,
            countryId,
            transaction?.currency_id
          );
        }
      },
    },
    { id: 'date', label: 'Date' },
    {
      id: 'description',
      label: 'Description',
      format: (value, transaction) => {
        return (
          <Link to={route('/transactions/:id', { id: transaction.id })}>
            {value}
          </Link>
        );
      },
    },
    { id: 'invoices', label: 'Invoices' },
    { id: 'expense', label: 'Expense' },
  ];

  return columns;
};
