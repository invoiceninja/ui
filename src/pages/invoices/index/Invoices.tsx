/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import invoiceStatus from 'common/constants/invoice-status';
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
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
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

  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={invoiceStatus} code={value} />,
    },
    {
      id: 'number',
      label: t('number'),
      format: (value, resource) => (
        <Link to={generatePath('/invoices/:id/edit', { id: resource.id })}>
          {resource.number}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, resource) => (
        <Link to={generatePath('/clients/:id', { id: resource.client.id })}>
          {resource.client.display_name}
        </Link>
      ),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource?.client.country_id,
          resource?.client.settings.currency_id ? resource?.client.settings.currency_id : company.settings.currency_id
        ),
    },
    {
      id: 'balance',
      label: t('balance'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource?.client.country_id,
          resource?.client.settings.currency_id
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
  ];

  return (
    <Default title={t('invoices')} breadcrumbs={pages} docsLink="docs/invoices">
      <DataTable
        resource="invoice"
        endpoint="/api/v1/invoices?include=client"
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
