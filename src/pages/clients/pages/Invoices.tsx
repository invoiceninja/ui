/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Invoices() {
  const [t] = useTranslation();
  const { id } = useParams();

  const columns: DataTableColumns = [
    {
      id: 'number',
      label: t('invoice_number'),
      format: (value, resource) => (
        <Link to={generatePath('/invoices/:id', { id: resource.id })}>
          {value}
        </Link>
      ),
    },
    { id: 'date', label: t('date') },
    { id: 'amount', label: t('amount') },
    { id: 'balance', label: t('balance') },
    { id: 'due_date', label: t('due_date') },
    { id: 'status_id', label: t('status') },
  ];

  return (
    <DataTable
      resource="invoice"
      endpoint={`/api/v1/invoices?client_id=${id}`}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/invoices/bulk"
    />
  );
}
