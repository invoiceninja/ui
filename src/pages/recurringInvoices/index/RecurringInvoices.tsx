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
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';

export function RecurringInvoices() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('payments'), href: '/payments' }];
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
      id: 'client_id',
      label: t('client'),
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
    },
    {
      id: 'due_date_days',
      label: t('due_date'),
      format: (value) => {
        //needs translation
        if (value === 'terms') return t('use_payment_format');
        else if (Number(value) === 1) return t('first_day_of_month');
        else return value;
      },
    },
    {
      id: 'auto_bill',
      label: t('auto_bill'),
    },
  ];
  return (
    <Default breadcrumbs={pages} docsLink="docs/recurring-invoices/">
      <DataTable
        resource="reccuring_invoices"
        columns={columns}
        endpoint="/api/v1/recurring_invoices"
        linkToCreate="/recurring_invoices/create"
        linkToEdit="/recurring_invoices/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
