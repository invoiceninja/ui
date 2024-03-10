/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Document } from '../pages/Documents';
import {
  MdDownload,
  MdLockOutline,
  MdOutlineLockOpen,
  MdPreview,
} from 'react-icons/md';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { endpoint } from '$app/common/helpers';
import { defaultHeaders } from '$app/common/queries/common/headers';
import { DeleteDocumentAction } from '../components/DeleteDocumentAction';
import { useSetDocumentVisibility } from '$app/common/queries/documents';
import { $refetch } from '$app/common/hooks/useRefetch';

export function useDocumentActions() {
  const [t] = useTranslation();

  const queryClient = useQueryClient();
  const setDocumentVisibility = useSetDocumentVisibility();

  const downloadDocument = (doc: Document, inline: boolean) => {
    toast.processing();

    queryClient
      .fetchQuery(
        ['/api/v1/documents', doc.hash],
        () =>
          request(
            'GET',
            endpoint('/documents/:hash', { hash: doc.hash }),
            { headers: defaultHeaders() },
            { responseType: 'arraybuffer' }
          ),
        { staleTime: Infinity }
      )
      .then((response) => {
        const blob = new Blob([response.data], {
          type: response.headers['content-type'],
        });
        const url = URL.createObjectURL(blob);

        if (inline) {
          window.open(url);
          return;
        }

        const link = document.createElement('a');

        link.download = doc.name;
        link.href = url;
        link.target = '_blank';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        toast.dismiss();
      });
  };

  const actions = [
    (document: Document) => (
      <DropdownElement
        onClick={() => downloadDocument(document, true)}
        icon={<Icon element={MdPreview} />}
      >
        {t('view')}
      </DropdownElement>
    ),
    (document: Document) =>
      Boolean(document.is_public) && (
        <DropdownElement
          onClick={() =>
            setDocumentVisibility(document.id, false).then(() =>
              $refetch(['clients'])
            )
          }
          icon={<Icon element={MdLockOutline} />}
        >
          {t('set_private')}
        </DropdownElement>
      ),
    (document: Document) =>
      Boolean(!document.is_public) && (
        <DropdownElement
          onClick={() =>
            setDocumentVisibility(document.id, true).then(() =>
              $refetch(['clients'])
            )
          }
          icon={<Icon element={MdOutlineLockOpen} />}
        >
          {t('set_public')}
        </DropdownElement>
      ),
    (document: Document) => (
      <DropdownElement
        onClick={() => downloadDocument(document, false)}
        icon={<Icon element={MdDownload} />}
      >
        {t('download')}
      </DropdownElement>
    ),
    () => <Divider withoutPadding />,
    (document: Document) => <DeleteDocumentAction document={document} />,
  ];

  return actions;
}
