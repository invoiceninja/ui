/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import paymentStatus from 'common/constants/payment-status';
import paymentType from 'common/constants/payment-type';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';

export function Payments() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('payments'), href: '/payments' }];
  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => <StatusBadge for={paymentStatus} code={value} />,
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
      id: 'invoice_number',
      label: t('invoice_number'),
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'type_id',
      label: t('type'),
      format: (value) => <StatusBadge for={paymentType} code={value} />,
    },
    {
      id: 'transaction_reference',
      label: t('transaction_reference'),
    },
  ];
  return (
    <Default breadcrumbs={pages} docsLink="docs/payments/">
      <DataTable
        resource="payment"
        columns={columns}
        endpoint="/api/v1/payments"
        linkToCreate="/payments/create"
        linkToEdit="/payments/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
