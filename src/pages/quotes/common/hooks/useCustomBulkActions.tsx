/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Quote } from '$app/common/interfaces/quote';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useDownloadPdfs } from '$app/pages/invoices/common/hooks/useDownloadPdfs';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { useTranslation } from 'react-i18next';
import {
  MdContactPage,
  MdDone,
  MdDownload,
  MdMarkEmailRead,
  MdPrint,
} from 'react-icons/md';
import { useBulkAction } from './useBulkAction';
import { SendEmailBulkAction } from '../components/SendEmailBulkAction';
import { QuoteStatus } from '$app/common/enums/quote-status';
import { ConvertToInvoiceBulkAction } from '../components/ConvertToInoviceBulkAction';
import { ConvertToProjectBulkAction } from '../components/ConvertToProjectBulkAction';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { toast } from '$app/common/helpers/toast/toast';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';

export function useCustomBulkActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const printPdf = usePrintPdf({ entity: 'quote' });
  const downloadPdfs = useDownloadPdfs({ entity: 'quote' });

  const bulk = useBulkAction();

  const documentsBulk = useDocumentsBulk();

  const showApproveAction = (quotes: Quote[]) => {
    return quotes.every(
      ({ status_id }) =>
        status_id === QuoteStatus.Draft || status_id === QuoteStatus.Sent
    );
  };

  const showConvertToInvoiceAction = (quotes: Quote[]) => {
    return quotes.every(({ status_id }) => status_id !== QuoteStatus.Converted);
  };

  const showConvertToProjectAction = (quotes: Quote[]) => {
    return quotes.every(({ project_id }) => !project_id);
  };

  const showMarkSentAction = (quotes: Quote[]) => {
    return quotes.every(({ status_id }) => status_id === QuoteStatus.Draft);
  };

  const shouldDownloadDocuments = (quotes: Quote[]) => {
    return quotes.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (quotes: Quote[]) => {
    return quotes.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const customBulkActions: CustomBulkAction<Quote>[] = [
    (selectedIds, selectedQuotes, onActionSuccess) =>
      selectedQuotes && (
        <SendEmailBulkAction
          selectedIds={selectedIds}
          selectedQuotes={selectedQuotes}
          onActionSuccess={onActionSuccess}
        />
      ),
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
    (_, selectedQuotes) =>
      selectedQuotes?.length &&
      selectedQuotes[0].invoice_id && (
        <DropdownElement
          onClick={() =>
            navigate(
              route('/invoices/:id/edit', { id: selectedQuotes[0].invoice_id })
            )
          }
          icon={<Icon element={MdContactPage} />}
        >
          {t('view_invoice')}
        </DropdownElement>
      ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_, selectedProjects, onActionCall) => (
      <DropdownElement
        onClick={() =>
          selectedProjects && shouldDownloadDocuments(selectedProjects)
            ? documentsBulk(getDocumentsIds(selectedProjects), 'download')
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
    (selectedIds, selectedQuotes, onActionSuccess) =>
      selectedQuotes &&
      showMarkSentAction(selectedQuotes) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'sent', onActionSuccess)}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    (selectedIds, selectedQuotes, onActionSuccess) =>
      selectedQuotes &&
      showApproveAction(selectedQuotes) && (
        <DropdownElement
          onClick={() => bulk(selectedIds, 'approve', onActionSuccess)}
          icon={<Icon element={MdDone} />}
        >
          {t('approve')}
        </DropdownElement>
      ),
    (selectedIds, selectedQuotes, onActionSuccess) =>
      selectedQuotes &&
      showConvertToInvoiceAction(selectedQuotes) && (
        <ConvertToInvoiceBulkAction
          selectedIds={selectedIds}
          onActionSuccess={onActionSuccess}
        />
      ),
    (selectedIds, selectedQuotes, onActionSuccess) =>
      selectedQuotes &&
      showConvertToProjectAction(selectedQuotes) && (
        <ConvertToProjectBulkAction
          selectedIds={selectedIds}
          onActionSuccess={onActionSuccess}
        />
      ),
  ];

  return customBulkActions;
}
