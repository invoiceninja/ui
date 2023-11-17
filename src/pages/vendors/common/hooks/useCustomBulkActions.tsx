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
import { Vendor } from '$app/common/interfaces/vendor';
import { useDocumentsBulk } from '$app/common/queries/documents';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const documentsBulk = useDocumentsBulk();

  const shouldDownloadDocuments = (vendors: Vendor[]) => {
    return vendors.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (vendors: Vendor[]) => {
    return vendors.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const handleDownloadDocuments = (
    selectedVendors: Vendor[],
    setSelected?: Dispatch<SetStateAction<string[]>>
  ) => {
    const vendorIds = getDocumentsIds(selectedVendors);

    documentsBulk(vendorIds, 'download');
    setSelected?.([]);
  };

  const customBulkActions: CustomBulkAction<Vendor>[] = [
    ({ selectedResources, setSelected }) => (
      <DropdownElement
        onClick={() =>
          selectedResources && shouldDownloadDocuments(selectedResources)
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
