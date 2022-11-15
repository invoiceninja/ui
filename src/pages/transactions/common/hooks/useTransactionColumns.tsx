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
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCountries } from 'common/hooks/useCountries';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { Transaction } from 'common/interfaces/transactions';
import { DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'pages/transactions/components/EntityStatus';
import { useTranslation } from 'react-i18next';

export function useTransactionColumns() {
  const { t } = useTranslation();

  const countries = useCountries();

  const formatMoney = useFormatMoney();

  const resolveCurrency = useResolveCurrency();

  const getCountryIdByCurrencyCode = (currencyCode: string) => {
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
        const countryId = getCountryIdByCurrencyCode(
          resolveCurrency(transaction.currency_id)?.code || ''
        );
        if (transaction.base_type === 'CREDIT') {
          return formatMoney(
            transaction.amount,
            countryId,
            transaction.currency_id
          );
        }
      },
    },
    {
      id: 'withdrawal',
      label: t('withdrawal'),
      format: (value, transaction) => {
        const countryId = getCountryIdByCurrencyCode(
          resolveCurrency(transaction.currency_id)?.code || ''
        );
        if (transaction.base_type === 'DEBIT') {
          return formatMoney(
            transaction.amount,
            countryId,
            transaction.currency_id
          );
        }
      },
    },
    { id: 'date', label: t('date') },
    {
      id: 'description',
      label: t('description'),
      format: (value, transaction) => {
        return (
          <Link to={route('/transactions/:id', { id: transaction.id })}>
            {value}
          </Link>
        );
      },
    },
    { id: 'invoices', label: t('invoices') },
    { id: 'expense', label: t('expense') },
  ];

  return columns;
}
