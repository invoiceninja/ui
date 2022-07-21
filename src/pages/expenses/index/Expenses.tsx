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
import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { Expense } from 'common/interfaces/expense';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { Status } from './components/Status';

export function Expenses() {
  useTitle('expenses');

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages = [{ name: t('expenses'), href: '/expenses' }];

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  const columns: DataTableColumns<Expense> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, expense) => (
        <Link to={generatePath('/expense/:id/edit', { id: expense.id })}>
          <Status expense={expense} />
        </Link>
      ),
    },
    {
      id: 'number',
      label: t('number'),
      format: (field, expense) => (
        <Link to={generatePath('/expense/:id/edit', { id: expense.id })}>
          {field}
        </Link>
      ),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value) =>
        formatMoney(
          value,
          company?.settings.country_id,
          company?.settings.currency_id
        ),
    },
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
