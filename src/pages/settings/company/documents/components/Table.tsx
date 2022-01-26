/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
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
} from '@invoiceninja/tables';
import axios from 'axios';
import { date, endpoint } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { Document } from 'common/interfaces/document.interface';
import { defaultHeaders } from 'common/queries/common/headers';
import { useDocumentsQuery } from 'common/queries/documents';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { FileIcon } from 'components/FileIcon';
import { Spinner } from 'components/Spinner';
import prettyBytes from 'pretty-bytes';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export function Table() {
  const [t] = useTranslation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data, isLoading } = useDocumentsQuery({ perPage, currentPage });
  const queryClient = useQueryClient();

  const destroy = (id: string) => {
    toast.loading(t('processing'));

    axios
      .delete(endpoint('/api/v1/documents/:id', { id }), {
        headers: defaultHeaders,
      })
      .then(() => {
        toast.dismiss();
        toast.success(t('deleted_payment_term'));
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.error(t('error_title'));
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
                  <Dropdown>
                    <DropdownElement>
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

                    <DropdownElement>
                      <a
                        className="block w-full"
                        href={endpoint('/documents/:hash', {
                          hash: document.hash,
                        })}
                      >
                        {t('download')}
                      </a>
                    </DropdownElement>

                    <DropdownElement onClick={() => destroy(document.id)}>
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
    </>
  );
}
