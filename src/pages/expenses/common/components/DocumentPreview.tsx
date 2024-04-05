/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Document } from '$app/common/interfaces/document.interface';
import { defaultHeaders } from '$app/common/queries/common/headers';
import { FileIcon } from '$app/components/FileIcon';
import { Spinner } from '$app/components/Spinner';
import { Icon } from '$app/components/icons/Icon';
import { android } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdFirstPage,
  MdLastPage,
  MdNavigateBefore,
  MdNavigateNext,
} from 'react-icons/md';
import { useQueryClient } from 'react-query';

interface Props {
  documents: Document[];
}
export function DocumentPreview(props: Props) {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const { documents } = props;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [documentIndex, setDocumentIndex] = useState<number>(0);
  const [unableToPreview, setUnableToPreview] = useState<boolean>(false);

  const isDocumentPicture = () => {
    const documentType = documents[documentIndex]?.type;

    return (
      documentType === 'png' ||
      documentType === 'jpg' ||
      documentType === 'gif' ||
      documentType === 'webp' ||
      documentType === 'tiff'
    );
  };

  const isDocumentPdf = () => {
    const documentType = documents[documentIndex]?.type;

    return documentType === 'pdf';
  };

  useEffect(() => {
    if (documents.length) {
      setIsFormBusy(true);
      setUnableToPreview(false);

      if (documents[documentIndex]) {
        queryClient
          .fetchQuery(
            ['/api/v1/documents', documents[documentIndex]?.hash],
            () =>
              request(
                'GET',
                endpoint('/documents/:hash', {
                  hash: documents[documentIndex]?.hash,
                }),
                { headers: defaultHeaders() },
                { responseType: 'arraybuffer' }
              ),
            { staleTime: Infinity }
          )
          .then((response) => {
            const blob = new Blob([response.data], {
              type: response.headers['content-type'],
            });

            if (isDocumentPicture()) {
              setDocumentUrl(URL.createObjectURL(blob));
            } else if (!android && iframeRef.current && isDocumentPdf()) {
              iframeRef.current.src = URL.createObjectURL(blob);
            } else {
              setUnableToPreview(true);
            }
          })
          .finally(() => setIsFormBusy(false));
      } else {
        setDocumentIndex(0);
      }
    }

    return () => {
      setDocumentUrl('');
      setIsFormBusy(false);
      setUnableToPreview(false);
    };
  }, [documents, documentIndex]);

  if (android) {
    return <p>Unable to preview PDF. &nbsp;</p>;
  }

  return (
    <>
      {documents.length ? (
        <div className="flex flex-col">
          {!isFormBusy && (
            <div className="flex self-end pb-1">
              <Icon
                className="cursor-pointer"
                element={MdFirstPage}
                size={25}
                onClick={() => setDocumentIndex(0)}
              />
              <Icon
                className="cursor-pointer"
                element={MdNavigateBefore}
                size={25}
                onClick={() =>
                  documentIndex !== 0 &&
                  setDocumentIndex((current) => current - 1)
                }
              />

              <Icon
                className="cursor-pointer"
                element={MdNavigateNext}
                size={25}
                onClick={() =>
                  documentIndex !== documents.length - 1 &&
                  setDocumentIndex((current) => current + 1)
                }
              />
              <Icon
                className="cursor-pointer"
                element={MdLastPage}
                size={25}
                onClick={() => setDocumentIndex(documents.length - 1)}
              />
            </div>
          )}

          {isDocumentPicture() && !isFormBusy && !unableToPreview && (
            <img className="w-full" src={documentUrl} />
          )}

          <iframe
            ref={iframeRef}
            width="100%"
            height={
              isFormBusy || !isDocumentPdf() || unableToPreview ? 0 : 1500
            }
          />

          {unableToPreview && (
            <div className="flex h-full justify-center items-center">
              <FileIcon type={documents[documentIndex]?.type} size={150} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center">{t('no_records_found')}.</div>
      )}

      {isFormBusy && (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      )}
    </>
  );
}
