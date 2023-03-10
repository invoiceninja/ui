/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import invoiceStatus from '$app/common/constants/invoice-status';
import { route } from '$app/common/helpers/route';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { StatusBadge } from '$app/components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const dataTableStaleTime = 50;

export function Invoices() {
  const [t] = useTranslation();
  const { id } = useParams();

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('invoice_number'),
      format: (value, resource) => (
        <Link to={route('/invoices/:id/edit', { id: resource.id })}>
          {value}
        </Link>
      ),
    },
    { id: 'date', label: t('date') },
    { id: 'amount', label: t('amount') },
    { id: 'balance', label: t('balance') },
    { id: 'due_date', label: t('due_date') },
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={invoiceStatus} code={value} />,
    },
  ];

  return (
    <DataTable
      resource="invoice"
      endpoint={route('/api/v1/invoices?client_id=:id', { id })}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/invoices/bulk"
      linkToCreate={route('/invoices/create?client=:id', { id: id })}
      staleTime={dataTableStaleTime}
    />
  );
}
