/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { useDocumentsQuery } from '$app/common/queries/docuninja/documents';
import { useState } from 'react';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Td } from '$app/components/tables/Td';
import { Icon } from '$app/components/icons/Icon';
import { MdViewCozy } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import {
  MemoizedTr,
  Pagination,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from '$app/components/tables';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { Spinner } from '$app/components/Spinner';
import { PerPage } from '$app/components/DataTable';
import { Button, Checkbox, InputField } from '$app/components/forms';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { FileContent } from '$app/components/icons/FileContent';

interface DocumentFile {
  id: string;
  filename: string;
  mime_type: string;
  page_position: number;
  page_count: number;
  metadata: any[];
  url: string | null;
  previews: string[];
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  description: string;
  status_id: number;
  is_deleted: boolean;
  user_id: string;
  files: DocumentFile[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

const STATUS_LABELS = {
  1: 'Draft',
  2: 'Sent',
  3: 'Viewed',
  4: 'Completed',
  5: 'Cancelled',
};

const STATUS_COLORS = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-green-100 text-green-800',
  5: 'bg-red-100 text-red-800',
};

export default function Documents() {
  useTitle('documents');

  const [t] = useTranslation();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [filter, setFilter] = useState<string>('');
  const [perPage, setPerPage] = useState<number>(20);
  const [selected, setSelected] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    data: documentsResponse,
    isLoading,
    error,
  } = useDocumentsQuery({
    currentPage: currentPage.toString(),
    perPage: perPage.toString(),
    filter,
  });

  const getStatusBadge = (statusId: number) => {
    const label =
      STATUS_LABELS[statusId as keyof typeof STATUS_LABELS] || 'Unknown';
    const colorClass =
      STATUS_COLORS[statusId as keyof typeof STATUS_COLORS] ||
      'bg-gray-100 text-gray-800';

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  return (
    <Card
      title={t('documents')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div className="flex flex-col px-4 sm:px-6 pt-4">
        <div className="flex justify-between">
          <InputField
            placeholder={t('search')}
            value={filter}
            onValueChange={(value) => setFilter(value)}
          />

          <Button to="/documents/create">{t('create')}</Button>
        </div>

        <Table>
          <Thead>
            <Th>
              <Checkbox
                checked={
                  selected.length === documentsResponse?.data?.data.length &&
                  documentsResponse?.data?.data.length > 0
                }
                onValueChange={(_, checked?: boolean) => {
                  if (checked) {
                    setSelected(
                      documentsResponse?.data?.data.map(
                        (document: Document) => document.id
                      )
                    );
                  } else {
                    setSelected([]);
                  }
                }}
              />
            </Th>

            <Th>{t('document')}</Th>
            <Th>{t('files')}</Th>
            <Th>{t('status')}</Th>
            <Th>{t('created_at')}</Th>
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

            {Boolean(
              documentsResponse &&
                !documentsResponse.data.data.length &&
                !isLoading &&
                error
            ) && (
              <Tr
                className="border-b"
                style={{
                  borderColor: colors.$20,
                }}
              >
                <Td colSpan={100}>
                  <div className="flex space-x-4 text-red-600">
                    <span>Error loading documents:</span>

                    <span>{(error as any)?.message || 'Unknown error'}</span>
                  </div>
                </Td>
              </Tr>
            )}

            {Boolean(
              documentsResponse &&
                !documentsResponse.data.data.length &&
                !isLoading
            ) && (
              <Tr
                className="border-b"
                style={{
                  borderColor: colors.$20,
                }}
              >
                <Td colSpan={5}>
                  <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
                    <FileContent size="3.5rem" color={colors.$17} />

                    <div className="flex flex-col items-center space-y-1">
                      <span
                        className="mt-2 text-sm font-medium"
                        style={{ color: colors.$3 }}
                      >
                        {t('no_documents')}
                      </span>

                      <p className="text-sm" style={{ color: colors.$17 }}>
                        {t('creating_new_document')}
                      </p>
                    </div>
                  </div>
                </Td>
              </Tr>
            )}

            {documentsResponse &&
              documentsResponse.data.data.map((document: Document) => (
                <MemoizedTr key={document.id} resource={document}>
                  <Td>
                    <Checkbox
                      checked={selected.includes(document.id)}
                      onValueChange={(value) =>
                        selected.includes(value)
                          ? setSelected((current) =>
                              current.filter((v) => v !== value)
                            )
                          : setSelected((current) => [...current, value])
                      }
                    />
                  </Td>

                  <Td>
                    <div className="flex space-x-2 items-center whitespace-nowrap">
                      <div>
                        <FileContent size="1.3rem" color={colors.$17} />
                      </div>

                      <div>
                        <div className="text-sm font-medium">
                          {document.description || 'Untitled Document'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {document.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </Td>

                  <Td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {document.files.length > 0 ? (
                        <div>
                          <div className="font-medium">
                            {document.files[0].filename}
                          </div>
                          {document.files.length > 1 && (
                            <div className="text-xs">
                              +{document.files.length - 1} more files
                            </div>
                          )}
                          <div className="text-xs">
                            {document.files[0].page_count}{' '}
                            {document.files[0].page_count === 1
                              ? 'page'
                              : 'pages'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">No files</span>
                      )}
                    </div>
                  </Td>

                  <Td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(document.status_id)}
                  </Td>

                  <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.files.length > 0
                      ? date(document.files[0].created_at, dateFormat)
                      : '-'}
                  </Td>

                  <Td>
                    <Dropdown label={t('actions')}>
                      <DropdownElement
                        to={route('/documents/:id', {
                          id: document.id,
                        })}
                        icon={<Icon element={MdViewCozy} />}
                      >
                        {t('view')}
                      </DropdownElement>
                    </Dropdown>
                  </Td>
                </MemoizedTr>
              ))}
          </Tbody>
        </Table>

        {documentsResponse && (
          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowsChange={(rows: PerPage) => setPerPage(Number(rows))}
            totalPages={documentsResponse?.data.meta.total_pages}
            totalRecords={documentsResponse?.data.meta.total}
          />
        )}
      </div>
    </Card>
  );
}
