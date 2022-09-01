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
import reccuringInvoice from 'common/constants/reccuring-invoice';
import recurringInvoicesFrequency from 'common/constants/recurring-invoices-frequency';
import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { RecurringInvoiceStatus } from '../common/components/RecurringInvoiceStatus';

export function RecurringInvoices() {
  useTitle('recurring_invoices');

  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const pages: BreadcrumRecord[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
  ];

  const columns: DataTableColumns<RecurringInvoice> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, recurringInvoice) => (
        <span className="inline-flex items-center space-x-4">
          <RecurringInvoiceStatus entity={recurringInvoice} />
        </span>
        ),
    },
    {
      id: 'number',
      label: t('number'),
      format: (value, recurringInvoice) => (
        <Link
          to={generatePath('/recurring_invoices/:id/edit', {
            id: recurringInvoice.id,
          })}
        >
          {value}
        </Link>
      ),
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, recurringInvoice) => (
        <Link
          to={generatePath('/clients/:id', { id: recurringInvoice.client_id })}
        >
          {recurringInvoice.client?.display_name}
        </Link>
      ),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, recurringInvoice) =>
        formatMoney(
          value,
          recurringInvoice.client?.country_id || company.settings.country_id,
          recurringInvoice.client?.settings.currency_id ||
            company.settings.currency_id
        ),
    },
    {
      id: 'remaining_cycles',
      label: t('remaining_cycles'),
      format: (value) => (Number(value) < 0 ? t('endless') : value),
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
        endpoint="/api/v1/recurring_invoices?include=client"
        linkToCreate="/recurring_invoices/create"
        linkToEdit="/recurring_invoices/:id/edit"
        bulkRoute="/api/v1/recurring_invoices/bulk"
        withResourcefulActions
      />
    </Default>
  );
}
