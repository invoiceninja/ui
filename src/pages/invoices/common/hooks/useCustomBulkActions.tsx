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
import { MdDownload, MdMarkEmailRead, MdPrint } from 'react-icons/md';
import { usePrintPdf } from './usePrintPdf';
import { useDownloadPdfs } from './useDownloadPdfs';
import { SendEmailBulkAction } from '../components/SendEmailBulkAction';
import { useBulk } from '$app/common/queries/invoices';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const printPdf = usePrintPdf({ entity: 'invoice' });
  const downloadPdfs = useDownloadPdfs({ entity: 'invoice' });

  const bulk = useBulk();

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
  ];

  return customBulkActions;
};
