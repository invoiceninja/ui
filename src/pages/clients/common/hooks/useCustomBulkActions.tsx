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
import { Client } from '$app/common/interfaces/client';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';
import { useDocumentsBulk } from '$app/common/queries/documents';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const documentsBulk = useDocumentsBulk();

  const getDocumentsIds = (clients: Client[]) => {
    return clients.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const shouldDownloadDocuments = (clients: Client[]) => {
    return clients.some(({ documents }) => documents.length);
  };

  const shouldShowDownloadDocuments = (clients: Client[]) => {
    return clients.every(({ is_deleted }) => !is_deleted);
  };

  const customBulkActions: CustomBulkAction<Client>[] = [
    (_, selectedClients, onActionCall) =>
      selectedClients &&
      shouldShowDownloadDocuments(selectedClients) && (
        <DropdownElement
          onClick={() =>
            shouldDownloadDocuments(selectedClients)
              ? documentsBulk(
                  getDocumentsIds(selectedClients),
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
