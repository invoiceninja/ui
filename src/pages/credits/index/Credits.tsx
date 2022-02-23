/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import creditStatus from 'common/constants/credit-status';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';

export function Credits() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();
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
    },
    { id: 'client_id', label: t('client') },
    { id: 'amount', label: t('amount') },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'paid_to_date',
      label: t('remaining'),
      //not sure if this check is ok since there is no "remaining" value
      format: (value, resource) => {
        return resource.amount - resource.paid_to_date;
      },
    },
  ];
  return (
    <Default breadcrumbs={pages} docsLink="docs/credits/">
      <DataTable
        resource="credit"
        endpoint="/api/v1/credits"
        columns={columns}
        linkToCreate="/credits/create"
        linkToEdit="/credits/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
