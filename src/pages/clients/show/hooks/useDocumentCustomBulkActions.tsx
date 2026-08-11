/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Document } from '../pages/Documents';

export function useDocumentCustomBulkActions() {
  const [t] = useTranslation();

  const downloadDocuments = (documentsIds: string[]) => {
    toast.processing();

    request('POST', endpoint('/api/v1/documents/bulk?per_page=100'), {
      action: 'download',
      ids: documentsIds,
    }).then(() => toast.success('exported_data'));
  };

  const actions: CustomBulkAction<Document>[] = [
    ({ selectedResources, setSelected }) => (
      <DropdownElement
        onClick={() => {
          downloadDocuments(selectedResources.map(({ id }) => id));
          setSelected([]);
        }}
        icon={<Icon element={MdDownload} />}
      >
        {t('download')}
      </DropdownElement>
    ),
  ];

  return actions;
}
