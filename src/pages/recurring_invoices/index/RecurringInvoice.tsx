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

export function RecurringInvoice() {
  const [t] = useTranslation();

  useTitle('recurring invoices');

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [
    { name: t('recurring invoices'), href: '/recurring_invoices' },
  ];

  const columns: DataTableColumns = [
    {
      id: 'status',
      label: t('status'),
    },
    { id: 'number', label: t('number') },
    { id: 'client', label: t('client') },
    {
      id: 'amount',
      label: t('amount'),
    },
    {
      id: 'remaining cycles',
      label: t('remaining cycles'),
    },
    {
      id: 'next send date',
      label: t('next send date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'frequency',
      label: t('frequency'),
    },
    {
      id: 'due date',
      label: t('due date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'auto bills',
      label: t('auto bills'),
      format: (value) => date(value, dateFormat),
    },
  ];

  return (
    <Default breadcrumbs={pages} title={t('recurring invoices')}>
      <DataTable
        resource="invoice"
        endpoint="api/v1/recurring_invoices"
        columns={columns}
        linkToCreate="/recurring_invoices/create"
        linkToEdit="/recurring_invoices/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
