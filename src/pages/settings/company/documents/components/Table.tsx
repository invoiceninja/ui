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
import { Document } from 'common/interfaces/document.interface';
import { useDocumentsQuery } from 'common/queries/documents';
import { FileIcon } from 'components/FileIcon';
import { Spinner } from 'components/Spinner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Table() {
  const [t] = useTranslation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');

  const { data } = useDocumentsQuery({ perPage, currentPage });

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
          {!data && (
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
                <Td>{document.updated_at}</Td>
                <Td>{document.type}</Td>
                <Td>{document.size}</Td>
                <Td></Td>
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
