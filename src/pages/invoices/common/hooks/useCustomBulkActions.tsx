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
import { MdDownload, MdPrint } from 'react-icons/md';
import { usePrintPdf } from './usePrintPdf';
import { useDownloadPdfs } from './useDownloadPdfs';
import { BiMoney } from 'react-icons/bi';
import { useBulk } from '$app/common/queries/invoices';
import { isInvoiceAutoBillable } from '../../edit/components/Actions';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const printPdf = usePrintPdf({ entity: 'invoice' });
  const downloadPdfs = useDownloadPdfs({ entity: 'invoice' });

  const bulk = useBulk();

  const showAutoBillAction = (invoices: Invoice[]) => {
    return (
      invoices.some((invoice) => isInvoiceAutoBillable(invoice)) ||
      !invoices.length
    );
  };

  const filterAutoBillableInvoiceIds = (invoices: Invoice[]) => {
    const filteredInvoices = invoices.filter((invoice) =>
      isInvoiceAutoBillable(invoice)
    );

    return filteredInvoices.map(({ id }) => id);
  };

  const customBulkActions: CustomBulkAction<Invoice>[] = [
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
    (_, selectedInvoices) =>
      selectedInvoices &&
      showAutoBillAction(selectedInvoices) && (
        <DropdownElement
          onClick={() =>
            bulk(filterAutoBillableInvoiceIds(selectedInvoices), 'auto_bill')
          }
          icon={<Icon element={BiMoney} />}
        >
          {t('auto_bill')}
        </DropdownElement>
      ),
  ];

  return customBulkActions;
};
