/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { Invoice } from 'common/interfaces/invoice';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Link } from 'components/forms/Link';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { InvoiceStatus } from '../common/components/InvoiceStatus';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Download } from 'react-feather';
import { useActions } from '../edit/components/Actions';

export function Invoices() {
  useTitle('invoices');

  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const pages = [{ name: t('invoices'), href: '/invoices' }];

  const importButton = (
    <ReactRouterLink to="/invoices/import">
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

  const columns: DataTableColumns<Invoice> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, invoice) => <InvoiceStatus entity={invoice} />,
    },
    {
      id: 'number',
      label: t('number'),
      format: (value, invoice) => (
        <Link to={generatePath('/invoices/:id/edit', { id: invoice.id })}>
          {invoice.number}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, invoice) => (
        <Link to={generatePath('/clients/:id', { id: invoice.client_id })}>
          {invoice.client?.display_name}
        </Link>
      ),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id || company?.settings.country_id,
          invoice.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id || company?.settings.country_id,
          invoice.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'due_date',
      label: t('due_date'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const actions = useActions();

  return (
    <Default title={t('invoices')} breadcrumbs={pages} docsLink="docs/invoices">
      <DataTable
        resource="invoice"
        endpoint="/api/v1/invoices?include=client&without_deleted_clients=true"
        columns={columns}
        bulkRoute="/api/v1/invoices/bulk"
        linkToCreate="/invoices/create"
        linkToEdit="/invoices/:id/edit"
        withResourcefulActions
        customActions={actions}
        rightSide={importButton}
      />
    </Default>
  );
}
