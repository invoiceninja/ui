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
import invoiceStatus from '$app/common/constants/invoice-status';
import { useColorScheme } from '$app/common/colors';
import {
  downloadBlob,
  downloadUrl,
  extractFilenameFromHeaders,
} from '$app/common/helpers/download';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { StatusBadge } from '$app/components/StatusBadge';
import { Button, Checkbox } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Spinner } from '$app/components/Spinner';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';
import { useQuery, useQueryClient } from 'react-query';
import type { AxiosError } from 'axios';

const BILLING_HISTORY_ENDPOINT = '/api/client/account_management/invoices';
const BILLING_INVOICE_DOWNLOAD_ENDPOINT =
  '/api/client/account_management/invoices/download';
const BILLING_INVOICE_PAY_ENDPOINT =
  '/api/client/account_management/invoices/pay';
const BILLING_HISTORY_QUERY_KEY = ['account_management', 'billing_history'];

interface BillingInvoice {
  id: string;
  amount: string;
  balance: string;
  number: string;
  date: string;
  due_date: string;
  status: number;
  payable: boolean;
  download: string;
}

interface BillingHistoryResponse {
  invoices?: BillingInvoice[];
  data?: BillingInvoice[] | { invoices?: BillingInvoice[] };
}

interface ErrorResponse {
  message?: string;
}

function extractBillingInvoices(payload: BillingHistoryResponse) {
  if (Array.isArray(payload.invoices)) {
    return payload.invoices;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && !Array.isArray(payload.data)) {
    return payload.data.invoices || [];
  }

  return [];
}

function getErrorMessage(error: unknown) {
  return (
    (error as AxiosError<ErrorResponse>).response?.data?.message ||
    'something_went_wrong'
  );
}

function getFallbackFilename(contentType: string, invoiceCount: number) {
  if (contentType.includes('zip')) {
    return 'billing-invoices.zip';
  }

  if (contentType.includes('pdf')) {
    return invoiceCount > 1 ? 'billing-invoices.pdf' : 'billing-invoice.pdf';
  }

  return invoiceCount > 1 ? 'billing-invoices.zip' : 'billing-invoice.pdf';
}

function parseJsonResponse(data: ArrayBuffer) {
  try {
    return JSON.parse(new TextDecoder().decode(data)) as Record<string, string>;
  } catch {
    return null;
  }
}

async function downloadInvoices(invoiceIds: string[]) {
  if (!invoiceIds.length) {
    return;
  }

  toast.processing();

  try {
    const response = await request(
      'POST',
      endpoint(BILLING_INVOICE_DOWNLOAD_ENDPOINT),
      { ids: invoiceIds },
      { responseType: 'arraybuffer' }
    );

    const contentType = String(
      response.headers['content-type'] || response.headers['Content-Type'] || ''
    );

    if (contentType.includes('application/json')) {
      const payload = parseJsonResponse(response.data);
      const invoiceDownloadUrl =
        payload?.download || payload?.download_url || payload?.url;

      if (invoiceDownloadUrl) {
        downloadUrl(invoiceDownloadUrl);
        payload?.message ? toast.success(payload.message) : toast.dismiss();

        return;
      }

      toast.error(payload?.message || 'something_went_wrong');

      return;
    }

    const filename =
      extractFilenameFromHeaders(response.headers) ||
      getFallbackFilename(contentType, invoiceIds.length);

    downloadBlob(response.data, filename, contentType || 'application/pdf');
    toast.dismiss();
  } catch {
    toast.error('something_went_wrong');
  }
}

export function BillingHistory() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const queryClient = useQueryClient();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string>();
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: invoices = [],
    isLoading,
    isError,
  } = useQuery(
    BILLING_HISTORY_QUERY_KEY,
    () =>
      request('POST', endpoint(BILLING_HISTORY_ENDPOINT)).then((response) =>
        extractBillingInvoices(response.data as BillingHistoryResponse)
      ),
    { staleTime: Infinity }
  );

  const selectableInvoiceIds = useMemo(
    () => invoices.map((invoice) => invoice.id).filter(Boolean),
    [invoices]
  );

  const selectedInvoiceIdSet = useMemo(
    () => new Set(selectedInvoiceIds),
    [selectedInvoiceIds]
  );

  const allInvoicesSelected =
    selectableInvoiceIds.length > 0 &&
    selectableInvoiceIds.every((id) => selectedInvoiceIdSet.has(id));

  useEffect(() => {
    setSelectedInvoiceIds((current) =>
      current.filter((id) => selectableInvoiceIds.includes(id))
    );
  }, [selectableInvoiceIds]);

  const handlePayInvoice = useCallback(
    async (invoice: BillingInvoice) => {
      if (payingInvoiceId) {
        return;
      }

      setPayingInvoiceId(invoice.id);
      toast.processing();

      try {
        const response = await request(
          'POST',
          endpoint(BILLING_INVOICE_PAY_ENDPOINT),
          { id: invoice.id }
        );

        if (response) {
          toast.success(response.data?.message || 'success');
          await queryClient.invalidateQueries(BILLING_HISTORY_QUERY_KEY);
        } else {
          toast.dismiss();
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPayingInvoiceId(undefined);
      }
    },
    [payingInvoiceId, queryClient]
  );

  const handleInvoiceSelection = useCallback(
    (invoiceId: string, checked?: boolean) => {
      setSelectedInvoiceIds((current) => {
        if (checked) {
          return Array.from(new Set([...current, invoiceId]));
        }

        return current.filter((id) => id !== invoiceId);
      });
    },
    []
  );

  const handleAllInvoiceSelection = useCallback(
    (_value: string, checked?: boolean) => {
      setSelectedInvoiceIds(checked ? selectableInvoiceIds : []);
    },
    [selectableInvoiceIds]
  );

  const handleDownloadSelected = useCallback(async () => {
    if (!selectedInvoiceIds.length || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadInvoices(selectedInvoiceIds);
      setSelectedInvoiceIds([]);
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, selectedInvoiceIds]);

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

  const renderPayButton = (invoice: BillingInvoice) =>
    invoice.payable ? (
      <Button
        behavior="button"
        type="secondary"
        className="!px-3 !py-1.5"
        disabled={Boolean(payingInvoiceId)}
        disableWithoutIcon={payingInvoiceId !== invoice.id}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          handlePayInvoice(invoice);
        }}
      >
        {t('pay_now')}
      </Button>
    ) : null;

  return (
    <div className="px-4 pb-6 sm:px-6">
      <div className="mb-3 flex justify-end">
        <Button
          behavior="button"
          type="secondary"
          disabled={!selectedInvoiceIds.length || isDownloading}
          disableWithoutIcon={!isDownloading}
          onClick={handleDownloadSelected}
        >
          <Icon element={MdDownload} />
          <span>{t('download_pdf')}</span>
        </Button>
      </div>

      <Table withoutPadding>
        <Thead>
          <Th className="w-10">
            <Checkbox
              checked={allInvoicesSelected}
              disabled={!selectableInvoiceIds.length}
              onValueChange={handleAllInvoiceSelection}
            />
          </Th>
          <Th>{t('invoice_number')}</Th>
          <Th>{t('invoice_date')}</Th>
          <Th>{t('due_date')}</Th>
          <Th>{t('amount')}</Th>
          <Th>{t('balance')}</Th>
          <Th>{t('status')}</Th>
          <Th></Th>
        </Thead>

        <Tbody>
          {!invoices.length && (
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

          {invoices.map((invoice) => (
            <Tr
              key={invoice.id}
              className="border-b"
              style={{ borderColor: colors.$20 }}
              withoutBackgroundColor
            >
              <Td>
                <Checkbox
                  value={invoice.id}
                  checked={selectedInvoiceIdSet.has(invoice.id)}
                  onValueChange={(_value, checked) =>
                    handleInvoiceSelection(invoice.id, checked)
                  }
                />
              </Td>
              <Td>{invoice.number}</Td>
              <Td>{invoice.date}</Td>
              <Td>{invoice.due_date}</Td>
              <Td>{invoice.amount}</Td>
              <Td>{invoice.balance}</Td>
              <Td>
                <StatusBadge for={invoiceStatus} code={invoice.status} />
              </Td>
              <Td>{renderPayButton(invoice)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
