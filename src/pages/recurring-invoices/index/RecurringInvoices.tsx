/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import reccuringInvoice from 'common/constants/reccuring-invoice';
import recurringInvoicesFrequency from 'common/constants/recurring-invoices-frequency';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';

export function RecurringInvoices() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();
  useTitle('recurring_invoices');
  const pages: BreadcrumRecord[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
  ];
  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={reccuringInvoice} code={value} />,
    },
    {
      id: 'number',
      label: t('number'),
    },
    {
      id: 'amount',
      label: t('amount'),
    },
    {
      id: 'remaining_cycles',
      label: t('remaining_cycles'),
      format: (value) => {
        if (Number(value) < 0) {
          return t('endless');
        } else return value;
      },
    },
    {
      id: 'next_send_date',
      label: t('next_send_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'frequency_id',
      label: t('frequency'),
      format: (value) => (
        <StatusBadge for={recurringInvoicesFrequency} code={value} headless />
      ),
    },
    {
      id: 'due_date_days',
      label: t('due_date'),
      format: (value) => {
        if (value === 'terms') return t('use_payment_terms');
        else if (Number(value) === 1) return t('first_day_of_the_month');
        else return value;
      },
    },
    {
      id: 'auto_bill',
      label: t('auto_bill'),
      format: (value) => t(String(value)),
    },
  ];
  return (
    <Default
      title={t('recurring_invoices')}
      breadcrumbs={pages}
      docsLink="docs/recurring-invoices/"
    >
      <DataTable
        resource="recurring_invoice"
        columns={columns}
        endpoint="/api/v1/recurring_invoices"
        linkToCreate="/recurring_invoices/create"
        linkToEdit="/recurring_invoices/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
