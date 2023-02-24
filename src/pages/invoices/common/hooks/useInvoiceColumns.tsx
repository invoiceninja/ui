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
import { date } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useResolveCountry } from 'common/hooks/useResolveCountry';
import { Credit } from 'common/interfaces/credit';
import { Invoice } from 'common/interfaces/invoice';
import { CopyToClipboard } from 'components/CopyToClipboard';
import { customField } from 'components/CustomField';
import { DataTableColumns } from 'components/DataTable';
import { EntityStatus } from 'components/EntityStatus';
import { useTranslation } from 'react-i18next';
import { InvoiceStatus } from '../components/InvoiceStatus';
import { useAllInvoiceColumns } from './useAllInvoiceColumns';
import { useDefaultInvoiceColumns } from './useDefaultInvoiceColumns';

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

export function useInvoiceColumns(): DataTableColumns<Invoice> {
  const invoiceColumns = useAllInvoiceColumns();
  type InvoiceColumns = typeof invoiceColumns[number];

  const defaultColumns = useDefaultInvoiceColumns();

  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const currentUser = useCurrentUser();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const resolveCountry = useResolveCountry();

  const customFields = company?.custom_fields;

  const firstCustomFieldLabel = customFields?.invoice1
    ? customField(customFields.invoice1).label()
    : t('first_custom');

  const secondCustomFieldLabel = customFields?.invoice2
    ? customField(customFields.invoice2).label()
    : t('second_custom');

  const thirdCustomFieldLabel = customFields?.invoice3
    ? customField(customFields.invoice3).label()
    : t('third_custom');

  const fourthCustomFieldLabel = customFields?.invoice4
    ? customField(customFields.invoice4).label()
    : t('fourth_custom');

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
      format: (_value, invoice) => (
        <Link to={route('/invoices/:id/edit', { id: invoice.id })}>
          {invoice.number}
        </Link>
      ),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id || company?.settings.country_id,
          invoice.client?.settings.currency_id || company?.settings.currency_id
        ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, invoice) => (
        <Link to={route('/clients/:id', { id: invoice.client_id })}>
          {invoice.client?.display_name}
        </Link>
      ),
    },
    {
      column: 'balance',
      id: 'balance',
      label: t('balance'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id || company?.settings.country_id,
          invoice.client?.settings.currency_id || company?.settings.currency_id
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
      column: firstCustomFieldLabel,
      id: 'custom_value1',
      label: firstCustomFieldLabel,
    },
    {
      column: secondCustomFieldLabel,
      id: 'custom_value2',
      label: secondCustomFieldLabel,
    },
    {
      column: thirdCustomFieldLabel,
      id: 'custom_value3',
      label: thirdCustomFieldLabel,
    },
    {
      column: fourthCustomFieldLabel,
      id: 'custom_value4',
      label: fourthCustomFieldLabel,
    },
    {
      column: 'discount',
      id: 'discount',
      label: t('discount'),
      format: (value, invoice) =>
        formatMoney(
          value,
          invoice.client?.country_id || company?.settings.country_id,
          invoice.client?.settings.currency_id || company?.settings.currency_id
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
          invoice.client?.country_id || company?.settings.country_id,
          invoice.client?.settings.currency_id || company?.settings.currency_id
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
      format: (value) => <span className="truncate">{value}</span>,
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => <span className="truncate">{value}</span>,
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
          invoice.client?.country_id || company?.settings.country_id,
          invoice.client?.settings.currency_id || company?.settings.currency_id
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
    currentUser?.company_user?.settings?.react_table_columns?.invoice ||
    defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
