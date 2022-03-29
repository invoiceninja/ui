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
import { useTitle } from 'common/hooks/useTitle';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';

export function Credits() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();
  const pages = [{ name: t('credits'), href: '/credits' }];
  useTitle(t('credits'));
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
    { id: 'amount', label: t('amount') },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'paid_to_date',
      label: t('remaining'),
      format: (value, resource) => {
        return resource.amount - resource.paid_to_date;
      },
    },
  ];
  return (
    <Default title={t('credits')} breadcrumbs={pages} docsLink="docs/credits/">
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
