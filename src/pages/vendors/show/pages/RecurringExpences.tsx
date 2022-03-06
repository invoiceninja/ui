/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
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
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { Tab, Tabs } from 'components/Tabs';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function RecurringExpenses() {
  const [t] = useTranslation();
  const { id } = useParams();

  const { dateFormat } = useCurrentCompanyDateFormats();
  const pages = [
    { name: t('vendors'), href: '/vendors' },
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
  ];

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
      id: 'entity_status',
      label: t('entity_status'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
  ];
  const tabs: Tab[] = [
    { name: t('details'), href: generatePath('/vendors/:id', { id }) },
    {
      name: t('expenses'),
      href: generatePath('/vendors/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: generatePath('/vendors/:id/recurring_expenses', { id }),
    },
    {
      name: t('documents'),
      href: generatePath('/vendors/:id/documents', { id }),
    },
  ];
  return (
    <Default
      title={t('recurring_expenses')}
      breadcrumbs={pages}
      docsLink="docs/recurring-expenses/"
    >
      <Tabs tabs={tabs} className="mt-6" />

      <DataTable
        resource="recurring_expense"
        endpoint={`/api/v1/recurring_expenses?client_id=${id}`}
        columns={columns}
        withResourcefulActions
        bulkRoute="/api/v1/recurring_expenses/bulk"
      />
    </Default>
  );
}
