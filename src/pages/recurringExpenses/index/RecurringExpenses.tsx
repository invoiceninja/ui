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
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function RecurringExpenses() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();
  const pages = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
  ];

  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
    },
    {
      id: 'number',
      label: t('number'),
    },
    { id: 'vendor_id', label: t('vendor') },

    { id: 'client_id', label: t('client') },
    { id: 'frequency_id', label: t('frequency') },
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
      id: 'entity_status',
      label: t('entity_status'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
  ];
  return (
    <Default
      title={t('recurring_expenses')}
      breadcrumbs={pages}
      docsLink="docs/recurring-expenses/"
    >
      <DataTable
        resource="recurring_expense"
        endpoint="/api/v1/recurring_expenses"
        columns={columns}
        linkToCreate="/recurring_expenses/create"
        linkToEdit="/recurring_expenses/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
