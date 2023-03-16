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
import frequency from '$app/common/constants/frequency';
import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { StatusBadge } from '$app/components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { dataTableStaleTime } from './Invoices';

export function RecurringInvoices() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns<RecurringInvoice> = [
    {
      id: 'frequency_id',
      label: t('frequency'),
      format: (value, recurringInvoice) => (
        <Link
          to={route('/recurring_invoices/:id/edit', {
            id: recurringInvoice.id,
          })}
        >
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
      format: (value) => (Number(value) < 0 ? t('endless') : value),
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
      linkToCreate={route('/recurring_invoices/create?client=:id', {
        id: id,
      })}
      staleTime={dataTableStaleTime}
    />
  );
}
