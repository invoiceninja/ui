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
} from 'react-icons/md';
import { usePrintPdf } from './usePrintPdf';
import { useDownloadPdfs } from './useDownloadPdfs';
import { SendEmailBulkAction } from '../components/SendEmailBulkAction';
import { useBulk } from '$app/common/queries/invoices';
import { BiPlusCircle } from 'react-icons/bi';
import { useEnterPayment } from './useEnterPayment';
import { toast } from '$app/common/helpers/toast/toast';
import { InvoiceStatus } from '$app/common/enums/invoice-status';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const printPdf = usePrintPdf({ entity: 'invoice' });
  const downloadPdfs = useDownloadPdfs({ entity: 'invoice' });

  const enterPayment = useEnterPayment();

  const bulk = useBulk();

  const handleEnterPayment = (invoices: Invoice[]) => {
    if (invoices.length) {
      const clientId = invoices[0].client_id;

      enterPayment(invoices, clientId);
    }
  };

  const showEnterPaymentOption = (invoices: Invoice[]) => {
    const hasAnyInvoiceForPaymentEntering = invoices.some(
      (invoice) => parseInt(invoice.status_id) < 4
    );

    return hasAnyInvoiceForPaymentEntering || !invoices.length;
  };

  const shouldDownloadDocuments = (invoices: Invoice[]) => {
    return invoices.some(({ documents }) => documents.length);
  };

  const showCancelInvoiceOption = (invoices: Invoice[]) => {
    return (
      invoices.some(({ status_id }) => status_id === InvoiceStatus.Sent) ||
      !invoices.length
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
    (selectedIds) => (
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
    (selectedIds) => (
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
    (selectedIds, selectedInvoices) =>
      selectedInvoices &&
      showCancelInvoiceOption(selectedInvoices) && (
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
