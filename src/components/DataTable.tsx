/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint, handleCheckboxChange, request } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';
import { Actions } from './datatables/Actions';
import { Dropdown } from './dropdown/Dropdown';
import { DropdownElement } from './dropdown/DropdownElement';
import { Button, Checkbox } from './forms';
import { Spinner } from './Spinner';
import {
  ColumnSortPayload,
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from './tables';

export type DataTableColumns = {
  id: string;
  label: string;
  format?: (field: string | number, resource?: any) => any;
}[];

interface Props {
  resource: string;
  columns: DataTableColumns;
  endpoint: string;
  linkToCreate?: string;
  linkToEdit?: string;
  withResourcefulActions?: ReactNode[] | boolean;
}

export function DataTable(props: Props) {
  const [t] = useTranslation();

  const [apiEndpoint, setApiEndpoint] = useState(props.endpoint);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState('10');
  const [sort, setSort] = useState('id|asc');
  const [sortedBy, setSortedBy] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState(['active']);
  const [selected, setSelected] = useState(new Set<string>());
  const queryClient = useQueryClient();

  const mainCheckbox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setApiEndpoint(
      endpoint(
        `${props.endpoint}?per_page=:perPage&page=:currentPage&filter=:filter&sort=:sort&status=:status`,
        { perPage, currentPage, filter, sort, status }
      )
    );
  }, [perPage, currentPage, filter, sort, status]);

  const { data, isLoading, isError } = useQuery(apiEndpoint, () =>
    axios.get(apiEndpoint, { headers: defaultHeaders })
  );

  const options = [
    { value: 'active', label: t('active') },
    { value: 'archived', label: t('archived') },
    { value: 'deleted', label: t('deleted') },
  ];

  const bulk = (action: 'archive' | 'restore' | 'delete') => {
    const toastId = toast.loading(t('processing'));

    request(
      'POST',
      endpoint(`${props.endpoint}/bulk`),
      {
        action,
        ids: Array.from(selected),
      },
      defaultHeaders
    )
      .then(() => {
        toast.success(t(`successfully_${action}_${props.resource}`), {
          id: toastId,
        });

        selected.clear();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /** @ts-ignore: Unreachable, if element is null/undefined. */
        mainCheckbox.current.checked = false;
      })
      .catch((error: AxiosError) => {
        console.error(error.response?.data);

        toast.error(t('error_title'), {
          id: toastId,
        });
      })
      .finally(() => queryClient.invalidateQueries(apiEndpoint));
  };

  return (
    <>
      <Actions
        onFilterChange={setFilter}
        optionsMultiSelect={true}
        options={options}
        defaultOption={options[0]}
        onStatusChange={setStatus}
        rightSide={
          props.linkToCreate && (
            <Button to={props.linkToCreate}>
              <span>{t(`new_${props.resource}`)}</span>
            </Button>
          )
        }
      >
        <span className="text-sm">{t('with_selected')}</span>

        <Dropdown label={t('actions')}>
          <DropdownElement onClick={() => bulk('archive')}>
            {t(`archive_${props.resource}`)}
          </DropdownElement>

          <DropdownElement onClick={() => bulk('restore')}>
            {t(`restore_${props.resource}`)}
          </DropdownElement>

          <DropdownElement onClick={() => bulk('delete')}>
            {t(`delete_${props.resource}`)}
          </DropdownElement>
        </Dropdown>
      </Actions>

      <Table>
        <Thead>
          <Th>
            <Checkbox
              innerRef={mainCheckbox}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                Array.from(
                  document.querySelectorAll('.child-checkbox')
                ).forEach((checkbox: HTMLInputElement | any) => {
                  checkbox.checked = event.target.checked;

                  event.target.checked
                    ? selected.add(checkbox.id)
                    : selected.delete(checkbox.id);
                });
              }}
            />
          </Th>
          {props.columns.map((column, index) => (
            <Th
              id={column.id}
              key={index}
              isCurrentlyUsed={sortedBy === column.id}
              onColumnClick={(data: ColumnSortPayload) => {
                setSortedBy(data.field);
                setSort(data.sort);
              }}
            >
              {column.label}
            </Th>
          ))}

          {props.withResourcefulActions && <Th></Th>}
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={100}>
                <Spinner />
              </Td>
            </Tr>
          )}

          {isError && (
            <Tr>
              <Td className="text-center" colSpan={100}>
                {t('error_refresh_page')}
              </Td>
            </Tr>
          )}

          {data &&
            data?.data?.data?.map((resource: any, index: number) => (
              <Tr key={index}>
                <Td>
                  <Checkbox
                    className="child-checkbox"
                    value={resource.id}
                    id={resource.id}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setSelected(
                        handleCheckboxChange(event.target.id, selected)
                      )
                    }
                  />
                </Td>

                {props.columns.map((column, index) => (
                  <Td key={index}>
                    {column.format
                      ? column.format(resource[column.id], resource)
                      : resource[column.id]}
                  </Td>
                ))}

                {props.withResourcefulActions && (
                  <Td>
                    <Dropdown label={t('actions')}>
                      {props.linkToEdit && (
                        <DropdownElement
                          to={generatePath(props.linkToEdit, {
                            id: resource.id,
                          })}
                        >
                          {t(`edit_${props.resource}`)}
                        </DropdownElement>
                      )}

                      {resource.archived_at === 0 && (
                        <DropdownElement
                          onClick={() => {
                            setSelected(new Set());
                            setSelected(selected.add(resource.id));
                            bulk('archive');
                          }}
                        >
                          {t(`archive_${props.resource}`)}
                        </DropdownElement>
                      )}

                      {resource.archived_at > 0 && (
                        <DropdownElement
                          onClick={() => {
                            setSelected(new Set());
                            setSelected(selected.add(resource.id));
                            bulk('restore');
                          }}
                        >
                          {t(`restore_${props.resource}`)}
                        </DropdownElement>
                      )}

                      {!resource.is_deleted && (
                        <DropdownElement
                          onClick={() => {
                            setSelected(new Set());
                            setSelected(selected.add(resource.id));
                            bulk('delete');
                          }}
                        >
                          {t(`delete_${props.resource}`)}
                        </DropdownElement>
                      )}
                    </Dropdown>
                  </Td>
                )}
              </Tr>
            ))}
        </Tbody>
      </Table>

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
