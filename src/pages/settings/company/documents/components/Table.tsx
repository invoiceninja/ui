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
import { useColorScheme } from '$app/common/colors';

export function Table() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const colors = useColorScheme();

  const reactSettings = useReactSettings();
  const setDocumentVisibility = useSetDocumentVisibility();

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const [documentId, setDocumentId] = useState('');
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  const [documentsUrls, setDocumentsUrls] = useState<DocumentUrl[]>([]);

  const { data } = useDocumentsQuery({
    companyDocuments: 'true',
  });

  const queryClient = useQueryClient();

  const getDocumentUrlById = (id: string) => {
    return documentsUrls.find(({ documentId }) => documentId === id)?.url;
  };

  const invalidateDocumentsQuery = () => {
    queryClient.invalidateQueries('/api/v1/documents');
  };

  const downloadDocument = async (doc: Document, inline: boolean) => {
    toast.processing();

    const response: AxiosResponse = await queryClient.fetchQuery(
      endpoint('/documents/:hash', { hash: doc.hash }),
      () =>
        request(
          'GET',
          endpoint('/documents/:hash', { hash: doc.hash }),
          { headers: defaultHeaders() },
          { responseType: 'arraybuffer' }
        ),
      { staleTime: Infinity }
    );

    toast.dismiss();

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
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const destroy = (password: string, isRequired = true) => {
    toast.processing();

    request(
      'delete',
      endpoint('/api/v1/documents/:id', { id: documentId }),
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
      <div className="grid grid-cols-12 mt-4 gap-4">
        {data?.data.data.map((document: Document, index: number) => (
          <div
            key={index}
            className="col-span-12 lg:col-span-6 border rounded"
            style={{ borderColor: colors.$5 }}
          >
            <div
              className="cursor-pointer hover:opacity-60 border-b"
              onClick={() => downloadDocument(document, true)}
              style={{ borderColor: colors.$5 }}
            >
              {reactSettings.show_document_preview &&
              (document.type === 'png' || document.type === 'jpg') ? (
                <>
                  {getDocumentUrlById(document.id) ? (
                    <img
                      src={getDocumentUrlById(document.id)}
                      style={{ width: '100%', height: 200 }}
                    />
                  ) : (
                    <div
                      className="flex justify-center items-center"
                      style={{ width: '100%', height: 200 }}
                    >
                      <Spinner />
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="flex justify-center items-center"
                  style={{ width: '100%', height: 200 }}
                >
                  <FileIcon type={document.type} height={36} />
                </div>
              )}
            </div>

            <div
              className="flex flex-1 flex-col space-y-5 py-4"
              style={{ backgroundColor: colors.$1 }}
            >
              <div className="flex flex-1 justify-between items-center px-2 space-x-1">
                <div className="flex items-center space-x-2 min-w-0">
                  {(document.type === 'png' || document.type === 'jpg') && (
                    <FileIcon type={document.type} />
                  )}

                  <span className="flex-1 font-bold truncate">
                    {document.name}
                  </span>
                </div>

                <div>
                  {document.is_public ? (
                    <Icon element={MdOutlineLockOpen} size={27} />
                  ) : (
                    <Icon element={MdLockOutline} size={27} />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start px-2">
                <div className="flex flex-col text-xs text-gray-500">
                  <span>{date(document.updated_at, dateFormat)}</span>
                  <span>{prettyBytes(document.size)}</span>
                </div>

                <Dropdown
                  label={t('more_actions')}
                  className="text-xs"
                  labelPadding="small"
                >
                  <DropdownElement
                    className="text-xs"
                    onClick={() => {
                      downloadDocument(document, true);
                    }}
                    icon={<Icon element={MdPageview} size={16} />}
                  >
                    {t('view')}
                  </DropdownElement>

                  <DropdownElement
                    className="text-xs"
                    onClick={() => {
                      downloadDocument(document, false);
                    }}
                    icon={<Icon element={MdDownload} size={16} />}
                  >
                    {t('download')}
                  </DropdownElement>

                  {document.is_public ? (
                    <DropdownElement
                      className="text-xs"
                      onClick={() => {
                        setDocumentVisibility(document.id, false).then(() =>
                          invalidateDocumentsQuery()
                        );
                      }}
                      icon={<Icon element={MdLockOutline} size={16} />}
                    >
                      {t('set_private')}
                    </DropdownElement>
                  ) : (
                    <DropdownElement
                      className="text-xs"
                      onClick={() => {
                        setDocumentVisibility(document.id, true).then(() =>
                          invalidateDocumentsQuery()
                        );
                      }}
                      icon={<Icon element={MdOutlineLockOpen} size={16} />}
                    >
                      {t('set_public')}
                    </DropdownElement>
                  )}

                  <DropdownElement
                    className="text-xs"
                    onClick={() => {
                      setDocumentId(document.id);
                      setPasswordConfirmModalOpen(true);
                    }}
                    icon={<Icon element={MdDelete} size={16} />}
                  >
                    {t('delete')}
                  </DropdownElement>
                </Dropdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setPasswordConfirmModalOpen}
        onSave={destroy}
      />
    </>
  );
}
