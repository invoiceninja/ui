/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import {
  MdCancel,
  MdDownload,
  MdMarkEmailRead,
  MdPaid,
  MdPrint,
  MdRefresh,
} from 'react-icons/md';
import { usePrintPdf } from './usePrintPdf';
import { useDownloadPdfs } from './useDownloadPdfs';
import { SendEmailBulkAction } from '../components/SendEmailBulkAction';
import { useBulk } from '$app/common/queries/invoices';
import { BiMoney, BiPlusCircle } from 'react-icons/bi';
import { useEnterPayment } from './useEnterPayment';
import { toast } from '$app/common/helpers/toast/toast';
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import collect from 'collect.js';
import { isInvoiceAutoBillable } from '../../edit/components/Actions';
import { useReverseInvoice } from './useReverseInvoice';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const printPdf = usePrintPdf({ entity: 'invoice' });
  const downloadPdfs = useDownloadPdfs({ entity: 'invoice' });

  const enterPayment = useEnterPayment();

  const bulk = useBulk();

  const reverseInvoice = useReverseInvoice();

  const showAutoBillAction = (invoices: Invoice[]) => {
    return !invoices.some((invoice) => !isInvoiceAutoBillable(invoice));
  };

  const handleEnterPayment = (invoices: Invoice[]) => {
    if (invoices.length) {
      const clientIds = collect(invoices).pluck('client_id').unique().toArray();

      if (clientIds.length > 1) {
        return toast.error('multiple_client_error');
      }

      enterPayment(invoices);
    }
  };

  const showEnterPaymentOption = (invoices: Invoice[]) => {
    return !invoices.some(
      (invoice) => parseInt(invoice.status_id) > parseInt(InvoiceStatus.Partial)
    );
  };

  const shouldDownloadDocuments = (invoices: Invoice[]) => {
    return invoices.some(({ documents }) => documents.length);
  };

  const showCancelOption = (invoices: Invoice[]) => {
    return !invoices.some(({ status_id }) => status_id !== InvoiceStatus.Sent);
  };

  const showMarkSendOption = (invoices: Invoice[]) => {
    return !invoices.some(
      ({ status_id, is_deleted }) =>
        status_id !== InvoiceStatus.Draft || is_deleted
    );
  };

  const showMarkPaidOption = (invoices: Invoice[]) => {
    return !invoices.some(
      ({ status_id, is_deleted }) =>
        parseInt(status_id) > parseInt(InvoiceStatus.Partial) || is_deleted
    );
  };

  const showReverseOption = (invoices: Invoice[]) => {
    return !invoices.some(
      ({ status_id, is_deleted, archived_at }) =>
        (status_id !== InvoiceStatus.Paid &&
          status_id !== InvoiceStatus.Partial) ||
        is_deleted ||
        archived_at
    );
  };

  const customBulkActions: CustomBulkAction<Invoice>[] = [
    (selectedIds) => <SendEmailBulkAction invoiceIds={selectedIds} />,
    (selectedIds) => (
      <DropdownElement
        onClick={() => printPdf(selectedIds)}
        icon={<Icon element={MdPrint} />}
      >
        {t('print_pdf')}
      </DropdownElement>
    ),
    (selectedIds) => (
      <DropdownElement
        onClick={() => downloadPdfs(selectedIds)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download_pdf')}
      </DropdownElement>
    ),
    (selectedIds, selectedInvoices) =>
      selectedInvoices &&
      showAutoBillAction(selectedInvoices) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'auto_bill')}
          icon={<Icon element={BiMoney} />}
        >
          {t('auto_bill')}
        </DropdownElement>
      ),
    (selectedIds, selectedInvoices) =>
      selectedInvoices &&
      showMarkSendOption(selectedInvoices) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'mark_sent')}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    (_, selectedInvoices) =>
      selectedInvoices &&
      showEnterPaymentOption(selectedInvoices) && (
        <DropdownElement
          onClick={() => handleEnterPayment(selectedInvoices)}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('enter_payment')}
        </DropdownElement>
      ),
    (selectedIds, selectedInvoices) =>
      selectedInvoices &&
      showMarkPaidOption(selectedInvoices) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'mark_paid')}
          icon={<Icon element={MdPaid} />}
        >
          {t('mark_paid')}
        </DropdownElement>
      ),
    (selectedIds, selectedInvoices) => (
      <DropdownElement
        onClick={() =>
          selectedInvoices && shouldDownloadDocuments(selectedInvoices)
            ? bulk(selectedIds, 'download')
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
    (_, selectedInvoices) =>
      selectedInvoices &&
      showReverseOption(selectedInvoices) && (
        <DropdownElement
          onClick={() => reverseInvoice(selectedInvoices[0])}
          icon={<Icon element={MdRefresh} />}
        >
          {t('reverse')}
        </DropdownElement>
      ),
    (selectedIds, selectedInvoices) =>
      selectedInvoices &&
      showCancelOption(selectedInvoices) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'cancel')}
          icon={<Icon element={MdCancel} />}
        >
          {t('cancel_invoice')}
        </DropdownElement>
      ),
  ];

  return customBulkActions;
};
