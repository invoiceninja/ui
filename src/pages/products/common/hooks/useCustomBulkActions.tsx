/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { MdDownload } from 'react-icons/md';
import { toast } from '$app/common/helpers/toast/toast';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Product } from '$app/common/interfaces/product';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useInvoiceProducts } from './useInvoiceProducts';
import { usePurchaseOrderProducts } from './usePurchaseOrderProducts';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const documentsBulk = useDocumentsBulk();

  const invoiceProducts = useInvoiceProducts();

  const purchaseOrderProducts = usePurchaseOrderProducts();

  const getDocumentsIds = (products: Product[]) => {
    return products.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const shouldDownloadDocuments = (products: Product[]) => {
    return products.some(({ documents }) => documents.length);
  };

  const shouldShowDownloadDocuments = (products: Product[]) => {
    return products.every(({ is_deleted }) => !is_deleted);
  };

  const shouldShowNewInvoice = (products: Product[]) => {
    return products.every(({ is_deleted }) => !is_deleted);
  };

  const shouldShowPurchaseOrder = (products: Product[]) => {
    return products.every(({ is_deleted }) => !is_deleted);
  };

  const handleDownloadDocuments = (
    selectedProducts: Product[],
    setSelected: Dispatch<SetStateAction<string[]>>
  ) => {
    const productIds = getDocumentsIds(selectedProducts);

    documentsBulk(productIds, 'download');
    setSelected([]);
  };

  const customBulkActions: CustomBulkAction<Product>[] = [
    ({ selectedResources, setSelected }) =>
      shouldShowNewInvoice(selectedResources) &&
      hasPermission('create_invoice') && (
        <DropdownElement
          onClick={() => {
            invoiceProducts(selectedResources);
            setSelected([]);
          }}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_invoice')}
        </DropdownElement>
      ),
    ({ selectedResources, setSelected }) =>
      shouldShowPurchaseOrder(selectedResources) &&
      hasPermission('create_purchase_order') && (
        <DropdownElement
          onClick={() => {
            purchaseOrderProducts(selectedResources);
            setSelected([]);
          }}
          icon={<Icon element={BiPlusCircle} />}
        >
          {t('new_purchase_order')}
        </DropdownElement>
      ),
    ({ selectedResources, setSelected }) =>
      shouldShowDownloadDocuments(selectedResources) && (
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
  ];

  return customBulkActions;
};
