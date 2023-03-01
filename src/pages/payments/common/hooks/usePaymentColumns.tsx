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
import paymentType from 'common/constants/payment-type';
import { date } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { Payment } from 'common/interfaces/payment';
import { customField } from 'components/CustomField';
import { EntityStatus } from 'components/EntityStatus';
import { StatusBadge } from 'components/StatusBadge';
import { Tooltip } from 'components/Tooltip';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import { PaymentStatus } from '../components/PaymentStatus';

export const paymentColumns = [
  'status',
  'number',
  'client',
  'amount',
  'invoice_number',
  'date',
  'type',
  'transaction_reference',
  'archived_at',
  //   'assigned_to', @Todo: Need to resolve relationship
  'converted_amount', // @Todo: How's this different to `amount`?
  'created_at',
  //   'created_by', @Todo: Need to resolve relationship
  //   'credit_number', @Todo: Need to resolve relationship
  'custom1',
  'custom2',
  'custom3',
  'custom4',
  'entity_state',
  'exchange_rate',
  //   'gateway', @Todo: Need to resolve relationship
  'is_deleted',
  'private_notes',
  'refunded',
  'updated_at',
] as const;

type PaymentColumns = typeof paymentColumns[number];

export const defaultColumns = [
  'status',
  'number',
  'client',
  'amount',
  'invoice_number',
  'date',
  'type',
  'transaction_reference',
];

export function usePaymentColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const currentUser = useCurrentUser();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const resolveCurrency = useResolveCurrency();

  const calculateConvertedAmount = (payment: Payment) => {
    if (payment.exchange_rate) {
      return payment.amount * payment.exchange_rate;
    }

    if (payment.client && payment.client.settings.currency_id?.length > 1) {
      const currency = resolveCurrency(payment.currency_id);

      if (currency) {
        return payment.amount * currency.exchange_rate;
      }
    }

    return payment.amount;
  };

  const columns: DataTableColumnsExtended<Payment, PaymentColumns> = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, payment) => <PaymentStatus entity={payment} />,
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, payment) => (
        <Link to={route('/payments/:id/edit', { id: payment.id })}>
          {payment.number}
        </Link>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, payment) => (
        <Link to={route('/clients/:id', { id: payment.client_id })}>
          {payment.client?.display_name}
        </Link>
      ),
    },
    {
      column: 'amount',
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
      column: 'invoice_number',
      id: 'id',
      label: t('invoice_number'),
      format: (value, payment) => payment.invoices?.[0]?.number,
    },
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'type',
      id: 'type_id',
      label: t('type'),
      format: (value) => (
        <StatusBadge for={paymentType} code={value} headless />
      ),
    },
    {
      column: 'transaction_reference',
      id: 'transaction_reference',
      label: t('transaction_reference'),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'converted_amount',
      id: 'amount',
      label: t('amount'),
      format: (value, payment) =>
        formatMoney(
          calculateConvertedAmount(payment),
          payment.client?.country_id || company?.settings.country_id,
          payment.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'custom1',
      id: 'custom_value1',
      label:
        (company?.custom_fields.payment1 &&
          customField(company?.custom_fields.payment1).label()) ||
        t('first_custom'),
    },
    {
      column: 'custom2',
      id: 'custom_value2',
      label:
        (company?.custom_fields.payment2 &&
          customField(company?.custom_fields.payment2).label()) ||
        t('second_custom'),
    },
    {
      column: 'custom3',
      id: 'custom_value3',
      label:
        (company?.custom_fields.payment3 &&
          customField(company?.custom_fields.payment3).label()) ||
        t('third_custom'),
    },
    {
      column: 'custom4',
      id: 'custom_value4',
      label:
        (company?.custom_fields.payment4 &&
          customField(company?.custom_fields.payment4).label()) ||
        t('forth_custom'),
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, payment) => <EntityStatus entity={payment} />,
    },
    {
      column: 'exchange_rate',
      id: 'exchange_rate',
      label: t('exchange_rate'),
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, payment) => (payment.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => (
        <Tooltip size="regular" truncate message={value as string}>
          <span>{value}</span>
        </Tooltip>
      ),
    },
    {
      column: 'refunded',
      id: 'refunded',
      label: t('refunded'),
      format: (value, payment) =>
        formatMoney(
          value,
          payment.client?.country_id || company?.settings.country_id,
          payment.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    currentUser?.company_user?.settings?.react_table_columns?.payment ||
    defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
