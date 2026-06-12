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
import {
  downloadBlob,
  downloadUrl,
  extractFilenameFromHeaders,
} from '$app/common/helpers/download';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import {
  CustomBulkAction,
  DataTable,
  DataTableColumns,
} from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { MouseEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';
import { useQueryClient } from 'react-query';

const BILLING_HISTORY_ENDPOINT = '/api/client/account_management/invoices';
const BILLING_INVOICE_DOWNLOAD_ENDPOINT =
  '/api/client/account_management/invoices/download';
const BILLING_INVOICE_PAY_ENDPOINT =
  '/api/client/account_management/invoices/pay';

interface BillingInvoice {
  id: string;
  amount: string;
  balance: string;
  number: string;
  date: string;
  due_date: string;
  status: string;
  payable: boolean;
  download: string;
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
  const queryClient = useQueryClient();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string>();

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
          queryClient.invalidateQueries(BILLING_HISTORY_ENDPOINT);
        } else {
          toast.dismiss();
        }
      } catch {
        toast.error('something_went_wrong');
      } finally {
        setPayingInvoiceId(undefined);
      }
    },
    [payingInvoiceId, queryClient]
  );

  const columns = useMemo<DataTableColumns<BillingInvoice>>(
    () => [
      { id: 'number', label: t('invoice_number') },
      {
        id: 'pay',
        label: '',
        format: (_field, invoice) =>
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
          ) : null,
      },
      { id: 'date', label: t('invoice_date') },
      { id: 'due_date', label: t('due_date') },
      { id: 'amount', label: t('amount') },
      { id: 'balance', label: t('balance') },
      { id: 'status', label: t('status') },
    ],
    [handlePayInvoice, payingInvoiceId, t]
  );

  const customBulkActions = useMemo<CustomBulkAction<BillingInvoice>[]>(
    () => [
      ({ selectedIds, setSelected }) => (
        <DropdownElement
          onClick={() => {
            downloadInvoices(selectedIds).then(() => setSelected([]));
          }}
          icon={<Icon element={MdDownload} />}
        >
          {t('download_pdf')}
        </DropdownElement>
      ),
    ],
    [t]
  );

  return (
    <div className="px-4 pb-6 sm:px-6">
      <DataTable<BillingInvoice>
        resource="billing_invoice"
        endpoint={BILLING_HISTORY_ENDPOINT}
        methodType="POST"
        columns={columns}
        customBulkActions={customBulkActions}
        styleOptions={{ withoutSortIcons: true }}
        dataPropPath={['data.invoices', 'data.data.invoices', 'data.data.data']}
        withoutDefaultBulkActions
        withoutFilter
        withoutPageAsPreference
        withoutPerPageAsPreference
        withoutSortQueryParameter
        withoutStatusFilter
        withoutStatusQueryParameter
        withoutStoringFilters
        clientSidePagination
      />
    </div>
  );
}
