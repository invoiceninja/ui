/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import paymentType from 'common/constants/payment-type';
import { date } from 'common/helpers';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from 'common/hooks/useTitle';
import { Payment } from 'common/interfaces/payment';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Link } from 'components/forms/Link';
import { Default } from 'components/layouts/Default';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { PaymentStatus } from '../common/components/PaymentStatus';
import { useEmailPayment } from '../common/hooks/useEmailPayment';

export function Payments() {
  useTitle('payments');

  const [t] = useTranslation();

  const formatMoney = useFormatMoney();
  const emailPayment = useEmailPayment();
  const company = useCurrentCompany();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: BreadcrumRecord[] = [{ name: t('payments'), href: '/payments' }];

  const columns: DataTableColumns<Payment> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (value, payment) => <PaymentStatus entity={payment} />,
    },
    {
      id: 'number',
      label: t('number'),
      format: (value, payment) => {
        return (
          <Link to={generatePath('/payments/:id/edit', { id: payment.id })}>
            {payment.number}
          </Link>
        );
      },
    },
    {
      id: 'client_id',
      label: t('client'),
      format: (value, payment) => (
        <Link to={generatePath('/clients/:id', { id: payment.client_id })}>
          {payment.client?.display_name}
        </Link>
      ),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, payment) =>
        formatMoney(
          value,
          payment.client?.country_id || company.settings.country_id,
          payment.client?.settings.currency_id || company.settings.currency_id
        ),
    },
    {
      id: 'invoice_number',
      label: t('invoice_number'),
      format: (value, payment) => payment.invoices?.[0]?.number,
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

  const actions = [
    (resource: Payment) =>
      resource.amount - resource.applied > 0 &&
      !resource.is_deleted && (
        <DropdownElement
          to={generatePath('/payments/:id/apply', { id: resource.id })}
        >
          {t('apply_payment')}
        </DropdownElement>
      ),
    (resource: Payment) =>
      resource.amount !== resource.refunded &&
      !resource.is_deleted && (
        <DropdownElement
          to={generatePath('/payments/:id/refund', { id: resource.id })}
        >
          {t('refund_payment')}
        </DropdownElement>
      ),
    (resource: Payment) => (
      <DropdownElement onClick={() => emailPayment(resource)}>
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
      />
    </Default>
  );
}
