/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { Product } from '$app/common/interfaces/product';
import { BiPlusCircle } from 'react-icons/bi';
import { useInvoiceProducts } from './useInvoiceProducts';
import { usePurchaseOrderProducts } from './usePurchaseOrderProducts';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

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

  const customBulkActions: CustomBulkAction<Product>[] = [
    (_, selectedProducts) => (
      <DropdownElement
        onClick={() => selectedProducts && invoiceProducts(selectedProducts)}
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_invoice')}
      </DropdownElement>
    ),
    (_, selectedProducts) => (
      <DropdownElement
        onClick={() =>
          selectedProducts && purchaseOrderProducts(selectedProducts)
        }
        icon={<Icon element={BiPlusCircle} />}
      >
        {t('new_purchase_order')}
      </DropdownElement>
    ),
    (_, selectedProducts, onActionCall) =>
      selectedProducts &&
      shouldShowDownloadDocuments(selectedProducts) && (
        <DropdownElement
          onClick={() =>
            shouldDownloadDocuments(selectedProducts)
              ? documentsBulk(
                  getDocumentsIds(selectedProducts),
                  'download',
                  onActionCall
                )
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
