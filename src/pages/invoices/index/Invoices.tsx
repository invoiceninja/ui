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
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Link } from 'components/forms/Link';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { InvoiceStatus } from '../common/components/InvoiceStatus';
import { openClientPortal } from '../common/helpers/open-client-portal';
import { useDownloadPdf } from '../common/hooks/useDownloadPdf';

export function Invoices() {
  useTitle('invoices');

  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const downloadPdf = useDownloadPdf({ resource: 'invoice' });
  const company = useCurrentCompany();

  const pages = [{ name: t('invoices'), href: '/invoices' }];

  const columns: DataTableColumns<Invoice> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, invoice) => (
        <span className="inline-flex items-center space-x-4">
          <InvoiceStatus entity={invoice} />
        </span>
        ),
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

  const actions = [
    (invoice: Invoice) => (
      <DropdownElement
        to={generatePath('/invoices/:id/pdf', { id: invoice.id })}
      >
        {t('view_pdf')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement onClick={() => downloadPdf(invoice)}>
        {t('download')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        to={generatePath('/invoices/:id/email', { id: invoice.id })}
      >
        {t('email_invoice')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement onClick={() => openClientPortal(invoice)}>
        {t('client_portal')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        to={generatePath('/invoices/:id/clone', { id: invoice.id })}
      >
        {t('clone_to_invoice')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        to={generatePath('/invoices/:id/clone/quote', { id: invoice.id })}
      >
        {t('clone_to_quote')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        to={generatePath('/invoices/:id/clone/credit', { id: invoice.id })}
      >
        {t('clone_to_credit')}
      </DropdownElement>
    ),
    (invoice: Invoice) => (
      <DropdownElement
        to={generatePath('/invoices/:id/clone/recurring_invoice', {
          id: invoice.id,
        })}
      >
        {t('clone_to_recurring')}
      </DropdownElement>
    ),
  ];

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
      />
    </Default>
  );
}
