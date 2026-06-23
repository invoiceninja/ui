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
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { GatewayToken } from '$app/common/interfaces/client';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Modal } from '$app/components/Modal';
import { StatusBadge } from '$app/components/StatusBadge';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, Checkbox } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Spinner } from '$app/components/Spinner';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';
import { useQuery, useQueryClient } from 'react-query';
import type { AxiosError, AxiosResponse } from 'axios';
import type { PaymentIntent as StripePaymentIntent } from '@stripe/stripe-js';
import {
  PaymentMethodForm,
  ResponsePaymentIntent,
} from './plan/PaymentMethodForm';

const BILLING_HISTORY_ENDPOINT = '/api/client/account_management/invoices';
const BILLING_INVOICE_DOWNLOAD_ENDPOINT =
  '/api/client/account_management/invoices/download';
const BILLING_INVOICE_PAYMENT_INTENT_ENDPOINT =
  '/api/client/account_management/invoices/payment/intent';
const BILLING_INVOICE_PAYMENT_RESPONSE_ENDPOINT =
  '/api/client/account_management/invoices/payment/response';
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
  const account = useCurrentAccount();
  const [payingInvoice, setPayingInvoice] = useState<BillingInvoice | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<BillingInvoice | null>(null);

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

  const { data: paymentMethods = [], isLoading: isPaymentMethodsLoading } =
    useQuery(
      ['/api/client/account_management/methods', account?.id],
      () =>
        request(
          'POST',
          endpoint('/api/client/account_management/methods'),
          {
            account_key: account?.key,
          },
          { skipIntercept: true }
        ).then(
          (response: AxiosResponse<GenericManyResponse<GatewayToken>>) =>
            response.data.data
        ),
      { enabled: Boolean(account) }
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
    (invoice: BillingInvoice) => {
      setPayingInvoice(invoice);
    },
    []
  );

  const handleClosePaymentModal = useCallback(() => {
    setPayingInvoice(null);
  }, []);

  const handleCreatePaymentIntent = useCallback(async () => {
    if (!payingInvoice) {
      throw new Error('Missing invoice');
    }

    const response = await request(
      'POST',
      endpoint(BILLING_INVOICE_PAYMENT_INTENT_ENDPOINT),
      { id: payingInvoice.id }
    );

    return response.data as ResponsePaymentIntent;
  }, [payingInvoice]);

  const handleFinalizeInvoicePayment = useCallback(
    async (stripePaymentIntent: StripePaymentIntent) => {
      if (!payingInvoice) {
        throw new Error('Missing invoice');
      }

      await request(
        'POST',
        endpoint(BILLING_INVOICE_PAYMENT_RESPONSE_ENDPOINT),
        {
          id: payingInvoice.id,
          payment_intent: stripePaymentIntent.id,
        }
      );

      await queryClient.invalidateQueries(BILLING_HISTORY_QUERY_KEY);
    },
    [payingInvoice, queryClient]
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

  const renderViewButton = (invoice: BillingInvoice) => (
    <Button
      type="minimal"
      behavior="button"
      onClick={() => setDetailInvoice(invoice)}
    >
      {t('view_details')}
    </Button>
  );

  return (
    <div className="px-4 pb-6 sm:px-6">
      <div className="mb-3 flex justify-start">
        <Dropdown
          label={t('more_actions')}
          disabled={!selectedInvoiceIds.length || isDownloading}
          cypressRef="bulkActionsDropdown"
          triggerCypressRef="bulkActionsTrigger"
        >
          <DropdownElement
            onClick={handleDownloadSelected}
            icon={<Icon element={MdDownload} />}
          >
            {t('download_pdf')}
          </DropdownElement>
        </Dropdown>
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
              <Td>
                <div className="flex items-center gap-2">
                  {renderViewButton(invoice)}
                  {invoice.payable && (
                    <Button
                      behavior="button"
                      type="secondary"
                      className="!px-3 !py-1.5"
                      onClick={() => setPayingInvoice(invoice)}
                    >
                      {t('pay_now')}
                    </Button>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal
        title={detailInvoice ? `${t('invoice')} ${detailInvoice.number}` : ''}
        visible={Boolean(detailInvoice)}
        onClose={() => setDetailInvoice(null)}
        size="regular"
      >
        {detailInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.$17 }}>
                  {t('invoice_number')}
                </div>
                <div className="text-sm font-medium">{detailInvoice.number}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.$17 }}>
                  {t('status')}
                </div>
                <StatusBadge for={invoiceStatus} code={detailInvoice.status} />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.$17 }}>
                  {t('invoice_date')}
                </div>
                <div className="text-sm">{detailInvoice.date}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.$17 }}>
                  {t('due_date')}
                </div>
                <div className="text-sm">{detailInvoice.due_date}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.$17 }}>
                  {t('amount')}
                </div>
                <div className="text-sm font-medium">{detailInvoice.amount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.$17 }}>
                  {t('balance')}
                </div>
                <div className="text-sm font-medium">{detailInvoice.balance}</div>
              </div>
            </div>

            {detailInvoice.payable && (
              <div className="flex justify-end pt-4 border-t" style={{ borderColor: colors.$20 }}>
                <Button
                  behavior="button"
                  type="primary"
                  onClick={() => {
                    setDetailInvoice(null);
                    setPayingInvoice(detailInvoice);
                  }}
                >
                  {t('pay_now')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        visible={Boolean(payingInvoice)}
        onClose={handleClosePaymentModal}
        title={t('pay_now')}
        size="regular"
        disableClosing={Boolean(payingInvoice)}
      >
        {isPaymentMethodsLoading ? (
          <div className="flex justify-center px-6 py-10">
            <Spinner />
          </div>
        ) : payingInvoice ? (
          <PaymentMethodForm
            tokens={paymentMethods}
            amount_string={payingInvoice.balance || payingInvoice.amount}
            onCreatePaymentIntent={handleCreatePaymentIntent}
            onFinalizeStripePayment={handleFinalizeInvoicePayment}
            onPaymentComplete={handleClosePaymentModal}
            onCancel={handleClosePaymentModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}
