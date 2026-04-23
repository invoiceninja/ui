/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Document } from '$app/common/interfaces/docuninja/api';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useDownloadDocument } from '$app/pages/documents/show/hooks/useDownloadDocument';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';

interface Props {
  blobUrl: string;
  document: Document;
}

export function Actions(props: Props) {
  const [t] = useTranslation();
  const { downloadDocument } = useDownloadDocument({ doc: props.document });

  return (
    <div className="flex space-x-3">
      <Button
        className="flex items-center space-x-1"
        onClick={downloadDocument}
      >
        <Icon element={MdDownload} color="white" />
        <span>{t('download')}</span>
      </Button>
    </div>
  );
}
