/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Pagination,
  Table as TableElement,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '$app/components/tables';
import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Document } from '$app/common/interfaces/document.interface';
import {
  useDocumentsQuery,
  useSetDocumentVisibility,
} from '$app/common/queries/documents';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { FileIcon } from '$app/components/FileIcon';
import { Icon } from '$app/components/icons/Icon';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { Spinner } from '$app/components/Spinner';
import prettyBytes from 'pretty-bytes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdDelete,
  MdDownload,
  MdLockOutline,
  MdOutlineLockOpen,
  MdPageview,
} from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useSetAtom } from 'jotai';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';
import { toast } from '$app/common/helpers/toast/toast';
import { defaultHeaders } from '$app/common/queries/common/headers';
import { AxiosResponse } from 'axios';
import { DocumentUrl } from '$app/components/DocumentsTable';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export function Table() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const reactSettings = useReactSettings();
  const setDocumentVisibility = useSetDocumentVisibility();

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');
  const [document, setDocument] = useState('');
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  const [documentsUrls, setDocumentsUrls] = useState<DocumentUrl[]>([]);

  const { data, isLoading } = useDocumentsQuery({
    perPage,
    currentPage,
    companyDocuments: 'true',
  });

  const queryClient = useQueryClient();

  const getDocumentUrlById = (id: string) => {
    return documentsUrls.find(({ documentId }) => documentId === id)?.url;
  };

  const invalidateDocumentsQuery = () => {
    queryClient.invalidateQueries('/api/v1/documents');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const destroy = (password: string, isRequired = true) => {
    toast.processing();

    request(
      'delete',
      endpoint('/api/v1/documents/:id', { id: document }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => toast.success('deleted_document'))
      .catch((error) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        }
      })
      .finally(() => invalidateDocumentsQuery());
  };

  useEffect(() => {
    if (reactSettings.show_document_preview && data) {
      (data.data.data as Document[]).forEach(async ({ id, hash, type }) => {
        const alreadyExist = documentsUrls.find(
          ({ documentId }) => documentId === id
        );

        if (!alreadyExist && (type === 'png' || type === 'jpg')) {
          const response: AxiosResponse = await queryClient.fetchQuery(
            ['documents', hash],
            () =>
              request(
                'GET',
                endpoint('/documents/:hash', { hash }),
                { headers: defaultHeaders() },
                { responseType: 'arraybuffer' }
              ),
            { staleTime: Infinity }
          );

          const blob = new Blob([response.data], {
            type: response.headers['content-type'],
          });
          const url = URL.createObjectURL(blob);

          setDocumentsUrls((currentDocumentUrls) => [
            ...currentDocumentUrls,
            { documentId: id, url },
          ]);
        }
      });
    }
  }, [reactSettings, data?.data.data]);

  return (
    <>
      <TableElement>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('date')}</Th>
          <Th>{t('type')}</Th>
          <Th>{t('size')}</Th>
          <Th></Th>
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={5}>
                <Spinner />
              </Td>
            </Tr>
          )}

          {data &&
            data.data.data.map((document: Document) => (
              <Tr key={document.id}>
                <Td>
                  <div
                    className="flex items-center space-x-10"
                    style={{ width: 'max-content' }}
                  >
                    <div className="flex items-center space-x-2">
                      <FileIcon type={document.type} />
                      <span>{document.name}</span>

                      {document.is_public ? (
                        <Icon element={MdOutlineLockOpen} size={27} />
                      ) : (
                        <Icon element={MdLockOutline} size={27} />
                      )}
                    </div>

                    {reactSettings.show_document_preview &&
                      (document.type === 'png' || document.type === 'jpg') && (
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
                    <DropdownElement icon={<Icon element={MdPageview} />}>
                      <a
                        target="_blank"
                        className="block w-full"
                        href={endpoint('/documents/:hash?inline=true', {
                          hash: document.hash,
                        })}
                        rel="noreferrer"
                      >
                        {t('view')}
                      </a>
                    </DropdownElement>

                    <DropdownElement icon={<Icon element={MdDownload} />}>
                      <a
                        className="block w-full"
                        href={endpoint('/documents/:hash', {
                          hash: document.hash,
                        })}
                      >
                        {t('download')}
                      </a>
                    </DropdownElement>

                    {document.is_public ? (
                      <DropdownElement
                        onClick={() => {
                          setDocumentVisibility(document.id, false).then(() =>
                            invalidateDocumentsQuery()
                          );
                        }}
                        icon={<Icon element={MdLockOutline} />}
                      >
                        {t('set_private')}
                      </DropdownElement>
                    ) : (
                      <DropdownElement
                        onClick={() => {
                          setDocumentVisibility(document.id, true).then(() =>
                            invalidateDocumentsQuery()
                          );
                        }}
                        icon={<Icon element={MdOutlineLockOpen} />}
                      >
                        {t('set_public')}
                      </DropdownElement>
                    )}

                    <DropdownElement
                      onClick={() => {
                        setDocument(document.id);
                        setPasswordConfirmModalOpen(true);
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
      </TableElement>

      {data && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsChange={setPerPage}
          totalPages={data.data.meta.pagination.total_pages}
        />
      )}
      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={destroy}
      />
    </>
  );
}
