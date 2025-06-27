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
import { useEffect, useMemo, useState } from 'react';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Td } from '$app/components/tables/Td';
import { Icon } from '$app/components/icons/Icon';
import { MdPageview } from 'react-icons/md';
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
import { Button, Checkbox, InputField, Link } from '$app/components/forms';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { FileContent } from '$app/components/icons/FileContent';
import { useDebounce } from 'react-use';
import { Badge, BadgeVariant } from '$app/components/Badge';

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

const STATUS_VARIANTS = {
  1: 'generic',
  2: 'light-blue',
  3: 'orange',
  4: 'green',
  5: 'red',
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
  const [currentData, setCurrentData] = useState<Document[]>([]);
  const [areRowsRendered, setAreRowsRendered] = useState<boolean>(false);

  const STATUS_LABELS = useMemo(
    () => ({
      1: t('draft'),
      2: t('sent'),
      3: t('viewed'),
      4: t('completed'),
      5: t('cancelled'),
    }),
    []
  );

  const {
    data: documentsResponse,
    isLoading,
    error,
    isFetching,
  } = useDocumentsQuery({
    currentPage: currentPage.toString(),
    perPage: perPage.toString(),
    filter,
  });

  useDebounce(
    () => {
      if (documentsResponse && !isFetching) {
        setCurrentData(documentsResponse.data.data);
      }
    },
    10,
    [documentsResponse, isFetching]
  );

  useEffect(() => {
    if (isLoading) {
      setCurrentData([]);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isFetching || isLoading) {
      setAreRowsRendered(false);
      setCurrentData([]);
    }
  }, [isFetching, isLoading]);

  useEffect(() => {
    if (!currentData.length) {
      setCurrentPage(1);
    }

    if (perPage === 10) {
      setAreRowsRendered(true);
    }

    if (perPage === 50) {
      setTimeout(() => {
        setAreRowsRendered(true);
      }, 50);
    }

    if (perPage === 100) {
      setTimeout(() => {
        setAreRowsRendered(true);
      }, 150);
    }
  }, [currentData]);

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

          <Button to="/documents/create">{t('new_document')}</Button>
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

            <Th>{t('id')}</Th>
            <Th>{t('name')}</Th>
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
                    <Link to={route('/documents/:id', { id: document.id })}>
                      {document.id.slice(-8)}
                    </Link>
                  </Td>

                  <Td>{document.description || t('untitled_document')}</Td>

                  <Td>
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
                      <span style={{ color: colors.$17 }}>
                        {t('no_files')}.
                      </span>
                    )}
                  </Td>

                  <Td>
                    <Badge
                      variant={
                        STATUS_VARIANTS[
                          document.status_id as keyof typeof STATUS_VARIANTS
                        ] as BadgeVariant
                      }
                    >
                      {
                        STATUS_LABELS[
                          document.status_id as keyof typeof STATUS_LABELS
                        ]
                      }
                    </Badge>
                  </Td>

                  <Td>
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
                        icon={<Icon element={MdPageview} />}
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
            totalPages={documentsResponse?.data.meta.last_page || 1}
            totalRecords={documentsResponse?.data.meta.total || 0}
          />
        )}
      </div>
    </Card>
  );
}
