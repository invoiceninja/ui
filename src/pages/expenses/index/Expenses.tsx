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
import { ExpenseStatus } from '../common/components/ExpenseStatus';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';

export function Expenses() {
  useTitle('expenses');

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages = [{ name: t('expenses'), href: '/expenses' }];

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

 const importButton = (
    <ReactRouterLink to="/expenses/import">
      <button className="inline-flex items-center justify-center py-2 px-4 rounded text-sm text-white bg-green-500 hover:bg-green-600">
        <svg
          className="w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="3 3 20 20"
        >
          <Download />
        </svg>
        <span>{t('import')}</span>
      </button>
    </ReactRouterLink>
  );

  const columns: DataTableColumns<Expense> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, expense: Expense) => (
        <Link to={generatePath('/expenses/:id/edit', { id: expense.id })}>
          <span className="inline-flex items-center space-x-4">
            <ExpenseStatus entity={expense} />
          </span>
        </Link>
      ),
    },
    {
      id: 'number',
      label: t('number'),
      format: (field, expense) => (
        <Link to={generatePath('/expenses/:id/edit', { id: expense.id })}>
          {field}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, expense) =>
        expense.client && (
          <Link to={generatePath('/clients/:id', { id: value.toString() })}>
            {expense.client.display_name}
          </Link>
        ),
    },
    {
      id: 'vendor_id',
      label: t('vendor'),
      format: (value, expense) =>
        expense.vendor && (
          <Link to={generatePath('/vendors/:id', { id: value.toString() })}>
            {expense.vendor.name}
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
        endpoint="/api/v1/expenses?include=client,vendor"
        columns={columns}
        bulkRoute="/api/v1/expenses/bulk"
        linkToCreate="/expenses/create"
        linkToEdit="/expenses/:id/edit"
        withResourcefulActions
        rightSide={importButton}
      />
    </Default>
  );
}
