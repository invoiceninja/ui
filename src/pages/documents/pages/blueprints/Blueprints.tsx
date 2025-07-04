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
import { useEffect, useState } from 'react';
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
import { FileContent } from '$app/components/icons/FileContent';
import { useDebounce } from 'react-use';
import { useBlueprintsQuery } from '$app/common/queries/docuninja/blueprints';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { Default } from '$app/components/layouts/Default';

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

export default function Blueprints() {
  useTitle('blueprints');

  const [t] = useTranslation();

  const pages = [
    {
      name: t('documents'),
      href: '/documents',
    },
    {
      name: t('blueprints'),
      href: '/documents/blueprints',
    },
  ];

  const colors = useColorScheme();

  const [filter, setFilter] = useState<string>('');
  const [perPage, setPerPage] = useState<number>(20);
  const [selected, setSelected] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentData, setCurrentData] = useState<Document[]>([]);
  const [areRowsRendered, setAreRowsRendered] = useState<boolean>(false);

  const {
    data: blueprintsResponse,
    isLoading,
    error,
    isFetching,
  } = useBlueprintsQuery({
    currentPage: currentPage.toString(),
    perPage: perPage.toString(),
    filter,
  });

  useDebounce(
    () => {
      if (blueprintsResponse && !isFetching) {
        setCurrentData(blueprintsResponse.data.data);
      }
    },
    10,
    [blueprintsResponse, isFetching]
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
    <Default title={t('blueprints')} breadcrumbs={pages}>
      <Card
        title={t('blueprints')}
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

            <Button to="/documents/blueprints/create">
              {t('new_blueprint')}
            </Button>
          </div>

          <Table>
            <Thead>
              <Th>
                <Checkbox
                  checked={
                    selected.length === blueprintsResponse?.data?.data.length &&
                    blueprintsResponse?.data?.data.length > 0
                  }
                  onValueChange={(_, checked?: boolean) => {
                    if (checked) {
                      setSelected(
                        blueprintsResponse?.data?.data.map(
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
                blueprintsResponse &&
                  !blueprintsResponse.data.data.length &&
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
                      <span>Error loading blueprints:</span>

                      <span>{(error as any)?.message || 'Unknown error'}</span>
                    </div>
                  </Td>
                </Tr>
              )}

              {Boolean(
                blueprintsResponse &&
                  !blueprintsResponse.data.data.length &&
                  !isLoading
              ) && (
                <Tr
                  className="border-b"
                  style={{
                    borderColor: colors.$20,
                  }}
                >
                  <Td colSpan={7}>
                    <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
                      <FileContent size="3.5rem" color={colors.$17} />

                      <div className="flex flex-col items-center space-y-1">
                        <span
                          className="mt-2 text-sm font-medium"
                          style={{ color: colors.$3 }}
                        >
                          {t('no_blueprints')}
                        </span>

                        <p className="text-sm" style={{ color: colors.$17 }}>
                          {t('new_blueprint')}
                        </p>
                      </div>
                    </div>
                  </Td>
                </Tr>
              )}

              {blueprintsResponse &&
                blueprintsResponse.data.data.map((blueprint: Blueprint) => (
                  <MemoizedTr key={blueprint.id} resource={blueprint}>
                    <Td>
                      <Checkbox
                        checked={selected.includes(blueprint.id)}
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
                      <Link
                        to={route('/documents/blueprints/:id', {
                          id: blueprint.id,
                        })}
                      >
                        {blueprint.id.slice(-8)}
                      </Link>
                    </Td>

                    <Td>{blueprint.name || t('untitled_blueprint')}</Td>

                    <Td>
                      <Dropdown label={t('actions')}>
                        <DropdownElement
                          to={route('/documents/blueprints/:id', {
                            id: blueprint.id,
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

          {blueprintsResponse && (
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onRowsChange={(rows: PerPage) => setPerPage(Number(rows))}
              totalPages={blueprintsResponse?.data.meta.last_page || 1}
              totalRecords={blueprintsResponse?.data.meta.total || 0}
            />
          )}
        </div>
      </Card>
    </Default>
  );
}
