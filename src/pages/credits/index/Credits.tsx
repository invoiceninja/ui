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
import creditStatus from 'common/constants/credit-status';
import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { Credit } from 'common/interfaces/credit';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function Credits() {
  useTitle('credits');

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const downloadPdf = useDownloadPdf({ resource: 'credit' });

  const pages = [{ name: t('credits'), href: '/credits' }];

  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={creditStatus} code={value} />,
    },
    {
      id: 'number',
      label: t('number'),
      format: (field, resource: Credit) => (
        <Link to={generatePath('/credits/:id/edit', { id: resource.id })}>
          {field}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (_, resource: Credit) => (
        <Link to={generatePath('/clients/:id', { id: resource.client_id })}>
          {resource.client?.display_name}
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
          resource?.client.settings.currency_id
        ),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'balance',
      label: t('remaining'),
      format: (_, resource) => {
        return formatMoney(
          resource.balance,
          resource?.client.country_id,
          resource?.client.settings.currency_id
        );
      },
    },
  ];

  const actions = [
    (credit: Credit) => (
      <DropdownElement to={generatePath('/credits/:id/pdf', { id: credit.id })}>
        {t('view_pdf')}
      </DropdownElement>
    ),
    (credit: Credit) => (
      <DropdownElement onClick={() => downloadPdf(credit)}>
        {t('download_pdf')}
      </DropdownElement>
    ),
    (credit: Credit) => (
      <DropdownElement
        to={generatePath('/credits/:id/email', { id: credit.id })}
      >
        {t('email_credit')}
      </DropdownElement>
    ),
    (credit: Credit) => (
      <DropdownElement onClick={() => openClientPortal(credit)}>
        {t('client_portal')}
      </DropdownElement>
    ),
  ];

  return (
    <Default title={t('credits')} breadcrumbs={pages} docsLink="docs/credits/">
      <DataTable
        resource="credit"
        endpoint="/api/v1/credits?include=client"
        bulkRoute="/api/v1/credits/bulk"
        columns={columns}
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        customActions={actions}
        withResourcefulActions
      />
    </Default>
  );
}
