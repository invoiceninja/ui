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

export function RecurringExpenses() {
  const [t] = useTranslation();

  useTitle('recurring expenses');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [
    { name: t('recurring expenses'), href: '/recurring_expenses' },
  ];

  const columns: DataTableColumns = [
    {
      id: 'status',
      label: t('status'),
    },
    { id: 'number', label: t('number') },
    { id: 'vendor', label: t('vendor') },
    { id: 'client', label: t('client') },
    {
      id: 'frequency',
      label: t('frequency'),
    },
    {
      id: 'next send date',
      label: t('next send date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'entity state',
      label: t('entity state'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Default breadcrumbs={pages} title={t('Recurring Expenses')}>
      <DataTable
        resource="recurring_expenses"
        endpoint="/api/v1/recurring_expenses"
        columns={columns}
        linkToCreate="/recurring_expenses/create"
        linkToEdit="/recurring_expenses/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
