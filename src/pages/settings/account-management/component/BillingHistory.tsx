/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useColorScheme } from '$app/common/colors';
import { useDateTime } from '$app/common/hooks/useDateTime';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Badge, BadgeVariant } from '$app/components/Badge';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Checkbox, InputField, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Spinner } from '$app/components/Spinner';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';
import { useQuery } from 'react-query';

const BILLING_HISTORY_ENDPOINT = '/api/client/account_management/invoices';
const BILLING_INVOICE_DOWNLOAD_ENDPOINT =
  '/api/client/account_management/invoices/download';

interface BillingInvoice {
  id: string;
  number?: string;
  invoice_number?: string;
  date?: string | number;
  invoice_date?: string | number;
  created_at?: string | number;
  start_date?: string | number;
  end_date?: string | number;
  period_start?: string | number;
  period_end?: string | number;
  billing_period?: string;
  plan?: string;
  plan_name?: string;
  seats?: number;
  num_users?: number;
  amount?: string | number;
  total?: string | number;
  currency_id?: string;
  status?: string;
  status_id?: string | number;
  payment_method?: string;
  payment_type?: string;
  card_brand?: string;
  card_last4?: string;
  download_url?: string;
  pdf_url?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveInvoices(payload: unknown): BillingInvoice[] {
  if (Array.isArray(payload)) {
    return payload as BillingInvoice[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data as BillingInvoice[];
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.data)) {
    return payload.data.data as BillingInvoice[];
  }

  return [];
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getInvoiceNumber(invoice: BillingInvoice) {
  return invoice.invoice_number || invoice.number || invoice.id;
}

function getInvoiceDate(invoice: BillingInvoice) {
  return invoice.invoice_date || invoice.date || invoice.created_at || '';
}

function getInvoiceStatus(invoice: BillingInvoice) {
  return String(invoice.status || invoice.status_id || 'unknown').toLowerCase();
}

function getInvoiceAmount(invoice: BillingInvoice) {
  return invoice.total ?? invoice.amount ?? 0;
}

function getPaymentMethod(invoice: BillingInvoice) {
  if (invoice.card_brand && invoice.card_last4) {
    return `${invoice.card_brand} ${invoice.card_last4}`;
  }

  return invoice.payment_method || invoice.payment_type || '';
}

function getStatusVariant(status: string): BadgeVariant {
  if (
    ['paid', 'active', 'complete', 'completed', 'succeeded'].includes(status)
  ) {
    return 'primary';
  }

  if (['open', 'pending', 'draft'].includes(status)) {
    return 'yellow';
  }

  if (['failed', 'past_due', 'unpaid'].includes(status)) {
    return 'red';
  }

  if (
    ['refunded', 'void', 'voided', 'cancelled', 'canceled'].includes(status)
  ) {
    return 'generic';
  }

  return 'blue';
}

export function BillingHistory() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const formatDate = useDateTime({ formatOnlyDate: true });
  const formatMoney = useFormatMoney();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isDownloadingInvoices, setIsDownloadingInvoices] = useState(false);

  const {
    data: invoices = [],
    isLoading,
    isError,
  } = useQuery(
    ['account_management', 'billing_history'],
    () =>
      request('POST', endpoint(BILLING_HISTORY_ENDPOINT)).then((response) =>
        resolveInvoices(response.data)
      ),
    { staleTime: Infinity }
  );

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceStatus = getInvoiceStatus(invoice);
      const matchesStatus = status === 'all' || invoiceStatus === status;

      const searchable = [
        getInvoiceNumber(invoice),
        invoice.plan,
        invoice.plan_name,
        getPaymentMethod(invoice),
        invoice.billing_period,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && searchable.includes(normalizedSearch);
    });
  }, [invoices, search, status]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(invoices.map(getInvoiceStatus))).filter(
      Boolean
    );

    return ['all', ...statuses];
  }, [invoices]);

  const visibleInvoiceIds = useMemo(
    () => filteredInvoices.map((invoice) => invoice.id),
    [filteredInvoices]
  );

  const selectedVisibleInvoiceIds = useMemo(
    () =>
      selectedInvoiceIds.filter((invoiceId) =>
        visibleInvoiceIds.includes(invoiceId)
      ),
    [selectedInvoiceIds, visibleInvoiceIds]
  );

  const allVisibleInvoicesSelected =
    Boolean(visibleInvoiceIds.length) &&
    selectedVisibleInvoiceIds.length === visibleInvoiceIds.length;

  const getPeriod = (invoice: BillingInvoice) => {
    if (invoice.billing_period) {
      return invoice.billing_period;
    }

    const start = invoice.period_start || invoice.start_date;
    const end = invoice.period_end || invoice.end_date;

    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }

    return '';
  };

  const getPlan = (invoice: BillingInvoice) => {
    const plan = invoice.plan_name || invoice.plan || '';
    const seats = invoice.seats || invoice.num_users;

    if (plan && seats) {
      return `${plan} / ${seats} ${t('users')}`;
    }

    return plan;
  };

  const toggleInvoiceSelection = (invoiceId: string, checked: boolean) => {
    setSelectedInvoiceIds((current) =>
      checked
        ? Array.from(new Set([...current, invoiceId]))
        : current.filter((selectedInvoiceId) => selectedInvoiceId !== invoiceId)
    );
  };

  const toggleVisibleInvoicesSelection = (checked: boolean) => {
    setSelectedInvoiceIds((current) =>
      checked
        ? Array.from(new Set([...current, ...visibleInvoiceIds]))
        : current.filter((invoiceId) => !visibleInvoiceIds.includes(invoiceId))
    );
  };

  const downloadInvoices = (invoiceIds: string[]) => {
    if (!invoiceIds.length || isDownloadingInvoices) {
      return;
    }

    setIsDownloadingInvoices(true);
    toast.processing();

    request('POST', endpoint(BILLING_INVOICE_DOWNLOAD_ENDPOINT), {
      ids: invoiceIds,
    })
      .then(() => {
        toast.success('downloaded_entities');
        setSelectedInvoiceIds([]);
      })
      .finally(() => setIsDownloadingInvoices(false));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center px-6 py-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="px-6 py-8 text-center text-sm"
        style={{ color: colors.$17 }}
      >
        {t('error_refresh_page')}
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-6 sm:px-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem_auto]">
        <InputField
          value={search}
          onValueChange={setSearch}
          placeholder={t('search')}
          changeOverride
        />

        <SelectField
          value={status}
          onValueChange={setStatus}
          customSelector
          dismissable={false}
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? t('status') : formatStatus(option)}
            </option>
          ))}
        </SelectField>

        <div className="flex md:justify-end">
          <Dropdown
            label={t('actions')}
            disabled={!selectedInvoiceIds.length || isDownloadingInvoices}
            cypressRef="bulkActionsDropdown"
            triggerCypressRef="bulkActionsTrigger"
          >
            <DropdownElement
              onClick={() => downloadInvoices(selectedInvoiceIds)}
              icon={<Icon element={MdDownload} />}
            >
              {t('download_pdf')}
            </DropdownElement>
          </Dropdown>
        </div>
      </div>

      <Table withoutPadding>
        <Thead>
          <Th withoutHorizontalPadding>
            <Checkbox
              checked={allVisibleInvoicesSelected}
              disabled={!visibleInvoiceIds.length}
              onValueChange={(_, checked) =>
                toggleVisibleInvoicesSelection(Boolean(checked))
              }
            />
          </Th>
          <Th>{t('invoice_number')}</Th>
          <Th>{t('invoice_date')}</Th>
          <Th>{t('range')}</Th>
          <Th>{t('plan')}</Th>
          <Th>{t('amount')}</Th>
          <Th>{t('status')}</Th>
          <Th>{t('payment_method')}</Th>
        </Thead>

        <Tbody>
          {!filteredInvoices.length && (
            <Tr>
              <Td colSpan={8}>
                <div className="flex items-center justify-center py-10">
                  <span className="text-sm" style={{ color: colors.$17 }}>
                    {t('no_records_found')}
                  </span>
                </div>
              </Td>
            </Tr>
          )}

          {filteredInvoices.map((invoice) => {
            const invoiceStatus = getInvoiceStatus(invoice);

            return (
              <Tr
                key={invoice.id}
                className="border-b"
                style={{ borderColor: colors.$20 }}
                withoutBackgroundColor
              >
                <Td withoutPadding className="px-2 lg:px-2.5 xl:px-4 py-2">
                  <Checkbox
                    value={invoice.id}
                    checked={selectedInvoiceIds.includes(invoice.id)}
                    onValueChange={(_, checked) =>
                      toggleInvoiceSelection(invoice.id, Boolean(checked))
                    }
                  />
                </Td>
                <Td>{getInvoiceNumber(invoice)}</Td>
                <Td>
                  {getInvoiceDate(invoice)
                    ? formatDate(getInvoiceDate(invoice))
                    : ''}
                </Td>
                <Td>{getPeriod(invoice)}</Td>
                <Td>{getPlan(invoice)}</Td>
                <Td>
                  {formatMoney(
                    getInvoiceAmount(invoice),
                    undefined,
                    invoice.currency_id,
                    2,
                    true
                  )}
                </Td>
                <Td>
                  <Badge variant={getStatusVariant(invoiceStatus)}>
                    {formatStatus(invoiceStatus)}
                  </Badge>
                </Td>
                <Td>{getPaymentMethod(invoice)}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
}
