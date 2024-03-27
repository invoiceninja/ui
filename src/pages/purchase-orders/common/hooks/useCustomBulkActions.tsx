/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useDownloadPdfs } from '$app/pages/invoices/common/hooks/useDownloadPdfs';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { useTranslation } from 'react-i18next';
import {
  MdContactPage,
  MdDesignServices,
  MdDownload,
  MdInventory,
  MdMarkEmailRead,
  MdPrint,
  MdSwitchRight,
} from 'react-icons/md';
import { SendEmailBulkAction } from '../components/SendEmailBulkAction';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { toast } from '$app/common/helpers/toast/toast';
import { Dispatch, SetStateAction } from 'react';
import { useBulk } from '$app/common/queries/purchase-orders';
import { PurchaseOrderStatus } from '$app/common/enums/purchase-order-status';
import { route } from '$app/common/helpers/route';
import { useNavigate } from 'react-router-dom';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

export function useCustomBulkActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const disableNavigation = useDisableNavigation();

  const bulk = useBulk();

  const documentsBulk = useDocumentsBulk();

  const printPdf = usePrintPdf({ entity: 'purchase_order' });
  const downloadPdfs = useDownloadPdfs({ entity: 'purchase_order' });

  const shouldDownloadDocuments = (purchaseOrders: PurchaseOrder[]) => {
    return purchaseOrders.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (purchaseOrders: PurchaseOrder[]) => {
    return purchaseOrders.flatMap(({ documents }) =>
      documents.map(({ id }) => id)
    );
  };

  const handleDownloadDocuments = (
    selectedPurchaseOrders: PurchaseOrder[],
    setSelected: Dispatch<SetStateAction<string[]>>
  ) => {
    const purchaseOrderIds = getDocumentsIds(selectedPurchaseOrders);

    documentsBulk(purchaseOrderIds, 'download');
    setSelected([]);
  };

  const showMarkSendAction = (purchaseOrders: PurchaseOrder[]) => {
    return purchaseOrders.every(
      ({ status_id }) => status_id === PurchaseOrderStatus.Draft
    );
  };

  const showConvertToExpenseAction = (purchaseOrders: PurchaseOrder[]) => {
    return purchaseOrders.every(({ expense_id }) => !expense_id);
  };

  const showAddToInventoryAction = (purchaseOrders: PurchaseOrder[]) => {
    return purchaseOrders.every(
      ({ status_id }) => status_id === PurchaseOrderStatus.Accepted
    );
  };

  const { setChangeTemplateVisible, setChangeTemplateResources } =
    useChangeTemplate();

  const customBulkActions: CustomBulkAction<PurchaseOrder>[] = [
    ({ selectedIds, setSelected }) => (
      <SendEmailBulkAction
        selectedIds={selectedIds}
        setSelected={setSelected}
      />
    ),
    ({ selectedIds, selectedResources, setSelected }) =>
      showMarkSendAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'mark_sent');
            setSelected([]);
          }}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    ({ selectedIds, setSelected }) => (
      <DropdownElement
        onClick={() => {
          printPdf(selectedIds);
          setSelected([]);
        }}
        icon={<Icon element={MdPrint} />}
      >
        {t('print_pdf')}
      </DropdownElement>
    ),
    ({ selectedIds, setSelected }) => (
      <DropdownElement
        onClick={() => {
          downloadPdfs(selectedIds);
          setSelected([]);
        }}
        icon={<Icon element={MdDownload} />}
      >
        {t('download_pdf')}
      </DropdownElement>
    ),
    ({ selectedResources }) =>
      selectedResources?.length &&
      selectedResources[0].expense_id &&
      !disableNavigation('expense', selectedResources[0].expense) && (
        <DropdownElement
          onClick={() =>
            navigate(
              route('/expenses/:id/edit', {
                id: selectedResources[0].expense_id,
              })
            )
          }
          icon={<Icon element={MdContactPage} />}
        >
          {`${t('view')} ${t('expense')}`}
        </DropdownElement>
      ),
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showConvertToExpenseAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'expense');
            setSelected([]);
          }}
          icon={<Icon element={MdSwitchRight} />}
        >
          {t('convert_to_expense')}
        </DropdownElement>
      ),
    ({ selectedIds, selectedResources, setSelected }) =>
      showAddToInventoryAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'add_to_inventory');
            setSelected([]);
          }}
          icon={<Icon element={MdInventory} />}
        >
          {t('add_to_inventory')}
        </DropdownElement>
      ),
    ({ selectedResources, setSelected }) => (
      <DropdownElement
        onClick={() =>
          shouldDownloadDocuments(selectedResources)
            ? handleDownloadDocuments(selectedResources, setSelected)
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
    ({ selectedResources }) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources(selectedResources);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
  ];

  return customBulkActions;
}
