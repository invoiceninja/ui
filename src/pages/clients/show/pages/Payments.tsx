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
import paymentStatus from 'common/constants/payment-status';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Payments() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('number'),
      format: (value, resource) => (
        <Link to={generatePath('/payments/:id/edit', { id: resource.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={paymentStatus} code={value} />,
    },
    {
      id: 'transaction_reference',
      label: t('transaction_reference'),
      format: (value) => value.toString().toUpperCase(),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <DataTable
      resource="payment"
      endpoint={`/api/v1/payments?client_id=${id}`}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/payments/bulk"
    />
  );
}
