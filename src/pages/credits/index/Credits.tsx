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
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function Credits() {
  useTitle('credits');

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();

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
      id: 'paid_to_date',
      label: t('remaining'),
      format: (_, resource) => {
        return formatMoney(
          resource.amount - resource.paid_to_date,
          resource?.client.country_id,
          resource?.client.settings.currency_id
        );
      },
    },
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
        withResourcefulActions
      />
    </Default>
  );
}
