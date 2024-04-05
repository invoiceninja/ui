/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { DataTableColumns } from '$app/components/DataTable';
import { EntityStatus } from '$app/components/EntityStatus';
import { Tooltip } from '$app/components/Tooltip';
import { useTranslation } from 'react-i18next';
import { InvoiceStatus } from '../components/InvoiceStatus';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';

export type DataTableColumnsExtended<TResource = any, TColumn = string> = {
  column: TColumn;
  id: keyof TResource;
  label: string;
  format?: (field: string | number, resource: TResource) => unknown;
}[];

export function resourceViewedAt(resource: Invoice | Credit) {
  let viewed = '';

  resource.invitations.map((invitation) => {
    if (invitation.viewed_date) {
      viewed = invitation.viewed_date;
    }
  });

  return viewed;
}

export const defaultColumns: string[] = [
  'status',
  'number',
  'client',
  'amount',
  'balance',
  'date',
  'due_date',
];

export function useAllInvoiceColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const invoiceColumns = [
    'status',
    'number',
    'amount',
    'client',
    'balance',
    'date',
    'due_date',
    'auto_bill_enabled',
    'client_postal_code',
    'archived_at',
    'client_city',
    'client_country',
    'client_state',
    'contact_email',
    'contact_name',
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'discount',
    'documents',
    'entity_state',
    'exchange_rate',
    'is_deleted',
    'is_viewed',
    'last_sent_date',
    'last_sent_template',
    'next_send_date',
    'partial_due',
    'partial_due_date',
    'po_number',
    'private_notes',
    'public_notes',
    'reminder1_sent',
    'reminder2_sent',
    'reminder3_sent',
    'reminder_last_sent',
    'tax_amount',
    'created_at',
    'updated_at',
  ] as const;

  return invoiceColumns;
}

export function useInvoiceColumns(): DataTableColumns<Invoice> {
  const invoiceColumns = useAllInvoiceColumns();
  type InvoiceColumns = (typeof invoiceColumns)[number];

  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const resolveCountry = useResolveCountry();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const columns: DataTableColumnsExtended<Invoice, InvoiceColumns> = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (_value, invoice) => <InvoiceStatus entity={invoice} />,
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, invoice) => (
        <DynamicLink
          to={route('/invoices/:id/edit', { id: invoice.id })}
          renderSpan={disableNavigation('invoice', invoice)}
        >
          {value}
        </DynamicLink>
      ),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id,
          invoice.client?.settings.currency_id
        ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, invoice) => (
        <DynamicLink
          to={route('/clients/:id', { id: invoice.client_id })}
          renderSpan={disableNavigation('client', invoice.client)}
        >
          {invoice.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      column: 'balance',
      id: 'balance',
      label: t('balance'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id,
          invoice.client?.settings.currency_id
        ),
    },
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'due_date',
      id: 'due_date',
      label: t('due_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'auto_bill_enabled',
      id: 'auto_bill_enabled',
      label: t('auto_bill_enabled'),
      format: (value, invoice) =>
        invoice.auto_bill_enabled ? t('Yes') : t('No'),
    },
    {
      column: 'client_postal_code',
      id: 'client_id',
      label: t('client_postal_code'),
      format: (value, invoice) => invoice.client?.postal_code,
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'client_city',
      id: 'client_id',
      label: t('client_city'),
      format: (value, invoice) => invoice.client?.city,
    },
    {
      column: 'client_country',
      id: 'client_id',
      label: t('client_country'),
      format: (value, invoice) =>
        invoice.client?.country_id &&
        resolveCountry(invoice.client?.country_id)?.name,
    },
    {
      column: 'client_state',
      id: 'client_id',
      label: t('client_state'),
      format: (value, invoice) => invoice.client?.state,
    },
    {
      column: 'contact_email',
      id: 'client_id',
      label: t('contact_email'),
      format: (value, invoice) =>
        invoice.client &&
        invoice.client.contacts.length > 0 && (
          <CopyToClipboard text={invoice.client?.contacts[0].email} />
        ),
    },
    {
      column: 'contact_name',
      id: 'client_id',
      label: t('contact_name'),
      format: (value, invoice) =>
        invoice.client &&
        invoice.client.contacts.length > 0 &&
        `${invoice.client?.contacts[0].first_name} ${invoice.client?.contacts[0].last_name}`,
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
      format: (value) => formatCustomFieldValue('invoice1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('invoice2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('invoice3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('invoice4', value?.toString()),
    },
    {
      column: 'discount',
      id: 'discount',
      label: t('discount'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id,
          invoice.client?.settings.currency_id
        ),
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, invoice) => invoice.documents.length,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, invoice) => <EntityStatus entity={invoice} />,
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
      format: (value, invoice) => (invoice.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'is_viewed',
      id: 'id',
      label: t('is_viewed'),
      format: (value, invoice) =>
        resourceViewedAt(invoice).length > 0
          ? date(resourceViewedAt(invoice), dateFormat)
          : t('no'),
    },
    {
      column: 'last_sent_date',
      id: 'last_sent_date',
      label: t('last_sent_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'last_sent_template',
      id: 'id',
      label: t('last_sent_template'),
      format: () => '', // Need to calculate manually
    },
    {
      column: 'next_send_date',
      id: 'next_send_date',
      label: t('next_send_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'partial_due',
      id: 'partial',
      label: t('partial'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id,
          invoice.client?.settings.currency_id
        ),
    },
    {
      column: 'partial_due_date',
      id: 'partial_due_date',
      label: t('partial_due_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'po_number',
      id: 'po_number',
      label: t('po_number'),
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
          <span
            dangerouslySetInnerHTML={{ __html: (value as string).slice(0, 50) }}
          />
        </Tooltip>
      ),
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span
            dangerouslySetInnerHTML={{ __html: (value as string).slice(0, 50) }}
          />
        </Tooltip>
      ),
    },
    {
      column: 'reminder1_sent',
      id: 'reminder1_sent',
      label: t('reminder1_sent'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'reminder2_sent',
      id: 'reminder2_sent',
      label: t('reminder2_sent'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'reminder3_sent',
      id: 'reminder3_sent',
      label: t('reminder3_sent'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'reminder_last_sent',
      id: 'reminder_last_sent',
      label: t('reminder_last_sent'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'tax_amount',
      id: 'total_taxes',
      label: t('total_taxes'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id,
          invoice.client?.settings.currency_id
        ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('last_updated'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.invoice || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
