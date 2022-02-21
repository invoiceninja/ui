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
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';

export function Payments() {
  const [t] = useTranslation();

  const pages: BreadcrumRecord[] = [{ name: t('payments'), href: '/payments' }];
  const columns: DataTableColumns = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value) => {
        value ? (
          <StatusBadge for={paymentStatus} code={value} />
        ) : (
          <EntityStatus entity={value}></EntityStatus>
        );
      },
    },
    {
      id: 'number',
      label: t('number'),
    },
    {
      id: 'client',
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
    },
    {
      id: 'type',
      label: t('type'),
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
