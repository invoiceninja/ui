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
import { useDocumentsQuery } from '$app/common/queries/documents';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { FileIcon } from '$app/components/FileIcon';
import { Icon } from '$app/components/icons/Icon';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { Spinner } from '$app/components/Spinner';
import prettyBytes from 'pretty-bytes';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { MdDelete, MdDownload, MdPageview } from 'react-icons/md';
import { useQueryClient } from 'react-query';

export function Table() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');
  const [document, setDocument] = useState('');
  const [isPasswordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  const { data, isLoading } = useDocumentsQuery({
    perPage,
    currentPage,
    companyDocuments: 'true',
  });

  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const destroy = (password: string, isRequired = true) => {
    const toastId = toast.loading(t('processing'));

    request(
      'delete',
      endpoint('/api/v1/documents/:id', { id: document }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => toast.success(t('deleted_document'), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() => queryClient.invalidateQueries('/api/v1/documents'));
  };

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
                <Td className="truncate">
                  <div className="flex items-center space-x-2">
                    <FileIcon type={document.type} />
                    <span>{document.name}</span>
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
