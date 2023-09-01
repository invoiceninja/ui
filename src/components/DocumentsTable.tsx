/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Document } from '$app/common/interfaces/document.interface';
import prettyBytes from 'pretty-bytes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDelete, MdDownload, MdPageview } from 'react-icons/md';
import { Dropdown } from './dropdown/Dropdown';
import { DropdownElement } from './dropdown/DropdownElement';
import { FileIcon } from './FileIcon';
import { Icon } from './icons/Icon';
import { PasswordConfirmation } from './PasswordConfirmation';
import { Table, Tbody, Td, Th, Thead, Tr } from './tables';
import { useSetAtom } from 'jotai';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';
import { defaultHeaders } from '$app/common/queries/common/headers';
import { useQueryClient } from 'react-query';
import { Spinner } from './Spinner';

interface Props {
  documents: Document[];
  onDocumentDelete?: () => unknown;
}

interface DocumentUrl {
  documentId: string;
  url: string;
}

export function DocumentsTable(props: Props) {
  const [t] = useTranslation();

  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState(false);

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const [documentId, setDocumentId] = useState<string>();

  const [documentsUrls, setDocumentsUrls] = useState<DocumentUrl[]>([]);

  const { dateFormat } = useCurrentCompanyDateFormats();

  const queryClient = useQueryClient();

  const getDocumentUrlById = (id: string) => {
    return documentsUrls.find(({ documentId }) => documentId === id)?.url;
  };

  const downloadDocument = (doc: Document, inline: boolean) => {
    toast.processing();

    queryClient.fetchQuery(
      endpoint('/documents/:hash', { hash: doc.hash }),
      () =>
        request(
          'GET',
          endpoint('/documents/:hash', { hash: doc.hash }),
          { headers: defaultHeaders() },
          { responseType: 'arraybuffer' }
        ).then((response) => {
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
        })
    );
  };

  const destroy = (password: string) => {
    toast.processing();

    request(
      'delete',
      endpoint('/api/v1/documents/:id', { id: documentId }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => {
        toast.success('deleted_document');
        props.onDocumentDelete?.();
      })
      .catch((error) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        }
      });
  };

  useEffect(() => {
    props.documents.forEach(async ({ id, hash }) => {
      const alreadyExist = documentsUrls.find(
        ({ documentId }) => documentId === id
      );

      if (!alreadyExist) {
        await queryClient.fetchQuery(
          endpoint('/documents/:hash', { hash }),
          () =>
            request(
              'GET',
              endpoint('/documents/:hash', { hash }),
              { headers: defaultHeaders() },
              { responseType: 'arraybuffer' }
            ).then((response) => {
              const blob = new Blob([response.data], {
                type: response.headers['content-type'],
              });
              const url = URL.createObjectURL(blob);

              setDocumentsUrls((currentDocumentUrls) => [
                ...currentDocumentUrls,
                { documentId: id, url },
              ]);
            })
        );
      }
    });
  }, [props.documents]);

  return (
    <>
      <Table>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('date')}</Th>
          <Th>{t('type')}</Th>
          <Th>{t('size')}</Th>
          <Th>{/* Placeholder for actions */}</Th>
        </Thead>

        <Tbody>
          {!props.documents.length && (
            <Tr>
              <Td colSpan={5}>{t('no_records_found')}</Td>
            </Tr>
          )}

          {props.documents.map((document, index) => (
            <Tr key={index}>
              <Td>
                <div
                  className="flex items-center space-x-10"
                  style={{ width: 'max-content' }}
                >
                  <div className="flex items-center space-x-2">
                    <FileIcon type={document.type} />
                    <span>{document.name}</span>
                  </div>

                  {(document.type === 'png' || document.type === 'jpg') && (
                    <>
                      {getDocumentUrlById(document.id) ? (
                        <img
                          src={getDocumentUrlById(document.id)}
                          style={{ width: 150, height: 75 }}
                        />
                      ) : (
                        <Spinner />
                      )}
                    </>
                  )}
                </div>
              </Td>
              <Td>{date(document.updated_at, dateFormat)}</Td>
              <Td>{document.type}</Td>
              <Td>{prettyBytes(document.size)}</Td>
              <Td>
                <Dropdown label={t('more_actions')}>
                  <DropdownElement
                    onClick={() => {
                      downloadDocument(document, true);
                    }}
                    icon={<Icon element={MdPageview} />}
                  >
                    {t('view')}
                  </DropdownElement>

                  <DropdownElement
                    onClick={() => {
                      downloadDocument(document, false);
                    }}
                    icon={<Icon element={MdDownload} />}
                  >
                    {t('download')}
                  </DropdownElement>

                  <DropdownElement
                    onClick={() => {
                      setDocumentId(document.id);
                      setIsPasswordConfirmModalOpen(true);
                    }}
                    icon={<Icon element={MdDelete} />}
                  >
                    {t('delete')}
                  </DropdownElement>
                </Dropdown>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={destroy}
      />
    </>
  );
}
