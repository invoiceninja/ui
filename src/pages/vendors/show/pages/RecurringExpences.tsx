/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import recurringInvoice from 'common/constants/reccuring-invoice';
import recurringInvoicesFrequency from 'common/constants/recurring-invoices-frequency';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function RecurringExpenses() {
  const [t] = useTranslation();
  const { id } = useParams();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={recurringInvoice} code={value} />,
    },
    {
      id: 'number',
      label: t('number'),
    },

    {
      id: 'frequency_id',
      label: t('frequency'),
      format: (value) => (
        <StatusBadge for={recurringInvoicesFrequency} code={value} headless />
      ),
    },

    {
      id: 'next_send_date',
      label: t('next_send_date'),
      format: (value) => date(value, dateFormat),
    },

    { id: 'amount', label: t('amount') },
    {
      id: 'public_notes',
      label: t('public_notes'),
    },
    {
      id: 'entity_state',
      label: t('entity_state'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
  ];

  return (
    <DataTable
      resource="recurring_expense"
      endpoint={`/api/v1/recurring_expenses?vendor_id=${id}`}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/recurring_expenses/bulk"
    />
  );
}
