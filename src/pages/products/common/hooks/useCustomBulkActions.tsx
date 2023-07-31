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

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const documentsBulk = useDocumentsBulk();

  const getDocumentsIds = (products: Product[]) => {
    return products.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const shouldDownloadDocuments = (products: Product[]) => {
    return products.some(({ documents }) => documents.length);
  };

  const customBulkActions: CustomBulkAction<Product>[] = [
    (_, selectedProducts, onActionCall) => (
      <DropdownElement
        onClick={() =>
          selectedProducts && shouldDownloadDocuments(selectedProducts)
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
