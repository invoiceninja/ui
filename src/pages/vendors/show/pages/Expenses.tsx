/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Expenses() {
  const { id } = useParams();
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, resource) => {
        if (resource.should_be_invoiced) return t('pending');
        else if (resource.invoice_id) return t('invoiced');
        else return t('logged');
      },
    },
    {
      id: 'number',
      label: t('number'),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    { id: 'amount', label: t('amount') },
    {
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      id: 'entity_state',
      label: t('entity_state'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
  ];

  return (
    <DataTable
      resource="expense"
      endpoint={`/api/v1/expenses?vendor_id=${id}`}
      columns={columns}
      bulkRoute="/api/v1/expenses/bulk"
      withResourcefulActions
    />
  );
}
