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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload, MdPrint } from 'react-icons/md';

export function useCustomBulkActions() {
  const [t] = useTranslation();

  const printPdf = usePrintPdf({ entity: 'quote' });
  const downloadPdfs = useDownloadPdfs({ entity: 'quote' });

  const customBulkActions: CustomBulkAction<Quote>[] = [
    (selectedIds) => (
      <>
      <DropdownElement
        onClick={() => printPdf(selectedIds)}
        icon={<Icon element={MdPrint} />}
      >
        {t('print_pdf')}
      </DropdownElement>
        <DropdownElement
        onClick={() => downloadPdfs(selectedIds)}
          icon={<Icon element={MdDownload} />}
      >
        {t('download_pdf')}
      </DropdownElement>
      </>
    ),
  ];

  return customBulkActions;
}
