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
import quoteStatus from 'common/constants/quote-status';
import { route } from 'common/helpers/route';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { dataTableStaleTime } from './Invoices';

export function Quotes() {
  const [t] = useTranslation();
  const { id } = useParams();

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('quote_number'),
      format: (value, resource) => (
        <Link to={route('/quotes/:id/edit', { id: resource.id })}>{value}</Link>
      ),
    },
    { id: 'date', label: t('date') },
    { id: 'amount', label: t('amount') },
    { id: 'valid_until', label: t('valid_until') },
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={quoteStatus} code={value} />,
    },
  ];

  return (
    <DataTable
      resource="quote"
      endpoint={`/api/v1/quotes?client_id=${id}`}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/quotes/bulk"
      linkToCreate={route('/quotes/create?client=:id', { id: id })}
      staleTime={dataTableStaleTime}
    />
  );
}
