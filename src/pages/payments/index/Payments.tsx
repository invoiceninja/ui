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
import { CustomResourcefulAction } from 'common/interfaces/custom-resourceful-action';
import { bulk } from 'common/queries/payments';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Link } from 'components/forms/Link';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

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
      format: (value, resource) => {
        return (
          <Link to={generatePath('/payments/:id/edit', { id: resource.id })}>
            {resource.number}
          </Link>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, resource) => (
        <Link to={generatePath('/clients/:id', { id: resource.client.id })}>
          {resource.client.display_name}
        </Link>
      ),
    },
    {
      id: 'amount',
      label: t('amount'),
    },
    {
      id: 'invoice_number',
      label: t('invoice_number'),
      format: (value, resource) => resource.invoices[0]?.number,
    },
    {
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'type_id',
      label: t('type'),
      format: (value) => (
        <StatusBadge for={paymentType} code={value} headless />
      ),
    },
    {
      id: 'transaction_reference',
      label: t('transaction_reference'),
    },
  ];
  const actions: CustomResourcefulAction[] = [
    (resource: any) => (
      <DropdownElement to={`${resource.id}/apply`}>
        {t('apply_payment')}
      </DropdownElement>
    ),
    (resource: any) => (
      <DropdownElement to={`${resource.id}/refund`}>
        {t('refund_payment')}
      </DropdownElement>
    ),
    (resource: any) => (
      <DropdownElement
        onClick={() => {
          bulk([resource.id], 'email');
        }}
      >
        {t('email_payment')}
      </DropdownElement>
    ),
  ];
  const customBulkActions: CustomResourcefulAction[] = [
    (resource: any) => (
      <DropdownElement
        onClick={() => {
          bulk([resource.id], 'email');
        }}
      >
        {t('email_payment')}
      </DropdownElement>
    ),
  ];
  return (
    <Default
      title={t('payments')}
      breadcrumbs={pages}
      docsLink="docs/payments/"
    >
      <DataTable
        resource="payment"
        columns={columns}
        endpoint="/api/v1/payments?include=client,invoices"
        linkToCreate="/payments/create"
        bulkRoute="/api/v1/payments/bulk"
        linkToEdit="/payments/:id/edit"
        withResourcefulActions
        customActions={actions}
        customBulkActions={customBulkActions}
      />
    </Default>
  );
}
