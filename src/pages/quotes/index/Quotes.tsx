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
import quoteStatus from 'common/constants/quote-status';
import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { Quote } from 'common/interfaces/quote';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function Quotes() {
  const { documentTitle } = useTitle('quotes');
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [t] = useTranslation();

  const pages: BreadcrumRecord[] = [
    { name: t('quotes'), href: generatePath('/quotes') },
  ];

  const formatMoney = useFormatMoney();

  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={quoteStatus} code={value} />,
    },
    { id: 'number', label: t('number') },
    {
      id: 'client_id',
      label: t('client'),
      format: (_, resource: Quote) => (
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
      id: 'valid_until',
      label: t('valid_until'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="quote"
        columns={columns}
        endpoint="/api/v1/quotes?include=client"
        linkToEdit="/quotes/:id/edit"
        linkToCreate="/quotes/create"
        withResourcefulActions
      />
    </Default>
  );
}
