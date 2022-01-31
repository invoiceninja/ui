/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Expenses() {
  const [t] = useTranslation();

  useTitle('expenses');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('expenses'), href: '/expenses' }];

  const columns: DataTableColumns = [
    {
      id: 'status',
      label: t('status'),
    },
    { id: 'number', label: t('number') },
    { id: 'vendor', label: t('vendor') },
    { id: 'client', label: t('client') },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'amount',
      label: t('amount'),
    },
    {
      id: 'entity state',
      label: t('entity state'),
    },
  ];

  return (
    <Default breadcrumbs={pages} title={t('expenses')}>
      <DataTable
        resource="expenses"
        endpoint="api/v1/expenses"
        columns={columns}
        linkToCreate="/expenses/create"
        linkToEdit="/expenses/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
