/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Expenses() {
  const [t] = useTranslation();
  useTitle('expenses');
  const { dateFormat } = useCurrentCompanyDateFormats();
  const pages = [{ name: t('expenses'), href: '/expenses' }];
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
      id: 'entity_status',
      label: t('entity_state'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
  ];
  return (
    <Default
      title={t('expenses')}
      breadcrumbs={pages}
      docsLink="docs/expenses/"
    >
      <DataTable
        resource="expense"
        endpoint="/api/v1/expenses"
        columns={columns}
        linkToCreate="/expenses/create"
        linkToEdit="/expenses/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
