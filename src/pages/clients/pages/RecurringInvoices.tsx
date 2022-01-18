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
import frequency from 'common/constants/frequency';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function RecurringInvoices() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns = [
    {
      id: 'frequency_id',
      label: t('frequency'),
      format: (value, resource) => (
        <Link to={generatePath('/recurring_invoices/:id', { id: resource.id })}>
          <StatusBadge headless for={frequency} code={value} />
        </Link>
      ),
    },
    {
      id: 'number',
      label: t('number'),
      format: (value) => (value === '' ? t('pending') : value),
    },
    {
      id: 'amount',
      label: t('amount'),
    },
    {
      id: 'remaining_cycles',
      label: t('remaining_cycles'),
    },
    {
      id: 'next_send_date',
      label: t('next_send_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'auto_bill',
      label: t('auto_bill'),
      format: (value) => t(`${value}`),
    },
  ];

  return (
    <DataTable
      resource="recurring_invoice"
      endpoint={`/api/v1/recurring_invoices?client_id=${id}`}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/recurring_invoices/bulk"
    />
  );
}
