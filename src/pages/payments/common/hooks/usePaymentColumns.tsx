/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import paymentType from '$app/common/constants/payment-type';
import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Payment } from '$app/common/interfaces/payment';
import { EntityStatus } from '$app/components/EntityStatus';
import { StatusBadge } from '$app/components/StatusBadge';
import { Tooltip } from '$app/components/Tooltip';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useTranslation } from 'react-i18next';
import { PaymentStatus } from '../components/PaymentStatus';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';

export const defaultColumns: string[] = [
  'status',
  'number',
  'client',
  'amount',
  'invoice_number',
  'date',
  'type',
  'transaction_reference',
];

export function useAllPaymentColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'payment',
    });

  const paymentColumns = [
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
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'entity_state',
    'exchange_rate',
    //   'gateway', @Todo: Need to resolve relationship
    'is_deleted',
    'private_notes',
    'refunded',
    'applied',
    'credits',
    'updated_at',
  ] as const;

  return paymentColumns;
}

export function usePaymentColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const paymentColumns = useAllPaymentColumns();
  type PaymentColumns = (typeof paymentColumns)[number];

  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const resolveCurrency = useResolveCurrency();
  const formatCustomFieldValue = useFormatCustomFieldValue();

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

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'payment',
    });

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
        <DynamicLink
          to={route('/payments/:id/edit', { id: payment.id })}
          renderSpan={disableNavigation('payment', payment)}
        >
          {payment.number}
        </DynamicLink>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, payment) => (
        <DynamicLink
          to={route('/clients/:id', { id: payment.client_id })}
          renderSpan={disableNavigation('client', payment.client)}
        >
          {payment.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (value, payment) =>
        formatMoney(
          value,
          payment.client?.country_id,
          payment.client?.settings.currency_id
        ),
    },
    {
      column: 'invoice_number',
      id: 'id',
      label: t('invoice_number'),
      format: (_, payment) => (
        <Tooltip
          placement="top"
          tooltipElement={
            <div className="flex space-x-2">
              {payment.invoices?.map((invoice) => (
                <DynamicLink
                  key={invoice.id}
                  to={route('/invoices/:id/edit', {
                    id: invoice.id,
                  })}
                  renderSpan={disableNavigation('invoice', invoice)}
                >
                  {invoice.number}
                </DynamicLink>
              ))}
            </div>
          }
          width="auto"
          disabled={Boolean((payment.invoices?.length ?? 0) < 4)}
        >
          <div className="flex space-x-2">
            {payment.invoices?.map(
              (invoice, index) =>
                index < 3 && (
                  <DynamicLink
                    key={invoice.id}
                    to={route('/invoices/:id/edit', {
                      id: invoice.id,
                    })}
                    renderSpan={disableNavigation('invoice', invoice)}
                  >
                    {invoice.number}
                  </DynamicLink>
                )
            )}
          </div>
        </Tooltip>
      ),
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
      id: 'converted_amount' as keyof Payment,
      label: t('converted_amount'),
      format: (value, payment) =>
        formatMoney(
          calculateConvertedAmount(payment),
          payment.client?.country_id,
          payment.client?.settings.currency_id
        ),
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: firstCustom,
      id: 'custom_value1',
      label: firstCustom,
      format: (value) => formatCustomFieldValue('payment1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('payment2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('payment3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('payment4', value?.toString()),
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
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span dangerouslySetInnerHTML={{ __html: value as string }} />
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
          payment.client?.country_id,
          payment.client?.settings.currency_id
        ),
    },
    {
      column: 'applied',
      id: 'applied',
      label: t('applied'),
      format: (value, payment) =>
        formatMoney(
          value,
          payment.client?.country_id,
          payment.client?.settings.currency_id
        ),
    },
    {
      column: 'credits',
      id: 'credits',
      label: t('credits'),
      format: (value, payment) =>
        formatMoney(
          payment.paymentables
            .filter((item) => item.credit_id != undefined)
            .reduce((sum, paymentable) => sum + paymentable.amount, 0),
          payment.client?.country_id,
          payment.client?.settings.currency_id
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
    reactSettings?.react_table_columns?.payment || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
