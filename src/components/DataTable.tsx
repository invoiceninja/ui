/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint, handleCheckboxChange } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Actions, SelectOption } from './datatables/Actions';
import { Button, Checkbox } from './forms';
import ResourcefulActions from './ResourcefulActions';
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
  bulkRoute?: string;
  customActions?: any;
  customBulkActions?: any;
}

export function DataTable(props: Props) {
  const [t] = useTranslation();

  const [apiEndpoint, setApiEndpoint] = useState(
    new URL(endpoint(props.endpoint))
  );

  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState('10');
  const [sort, setSort] = useState('id|asc');
  const [sortedBy, setSortedBy] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState(['active']);
  const [selected, setSelected] = useState(new Set<string>());

  const mainCheckbox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiEndpoint.searchParams.append('per_page', perPage);
    apiEndpoint.searchParams.append('page', currentPage.toString());
    apiEndpoint.searchParams.append('filter', filter);
    apiEndpoint.searchParams.append('sort', sort);
    apiEndpoint.searchParams.append('status', status as unknown as string);

    setApiEndpoint(apiEndpoint);
  }, [perPage, currentPage, filter, sort, status]);

  const { data, isLoading, isError } = useQuery(
    [apiEndpoint.href, perPage, currentPage, filter, sort, status],
    () => axios.get(apiEndpoint.href, { headers: defaultHeaders() })
  );

  const options: SelectOption[] = [
    {
      value: 'active',
      label: t('active'),
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      value: 'archived',
      label: t('archived'),
      color: 'white',
      backgroundColor: '#e6b05c',
    },
    {
      value: 'deleted',
      label: t('deleted'),
      color: 'white',
      backgroundColor: '#c95f53',
    },
  ];

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
        <ResourcefulActions
          type="bulk"
          mainCheckbox={mainCheckbox}
          endpoint={props.endpoint}
          bulkRoute={props.bulkRoute}
          apiEndpoint={apiEndpoint}
          setSelected={setSelected}
          selected={selected}
          resourceType={props.resource}
          linkToEdit={props.linkToEdit}
          label={`${t('actions')}`}
          onClick={() => {
            [...document.getElementsByClassName('child-checkbox')].forEach(
              (element: any) => (element.checked = false)
            );

            setSelected(new Set());
          }}
        >
          {props.customBulkActions &&
            props.customBulkActions?.map((action: any) => {
              return action(selected);
            })}
        </ResourcefulActions>
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

          {data && data.data.data.length === 0 && (
            <Tr>
              <Td colSpan={100}>{t('no_records_found')}</Td>
            </Tr>
          )}

          {data &&
            data?.data?.data?.map((resource: any, index: number) => (
              <Tr
                key={index}
                onClick={() => document.getElementById(resource.id)?.click()}
              >
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
                    <ResourcefulActions
                      type="default"
                      mainCheckbox={mainCheckbox}
                      endpoint={props.endpoint}
                      bulkRoute={props.bulkRoute}
                      apiEndpoint={apiEndpoint}
                      setSelected={setSelected}
                      selected={selected}
                      resourceType={props.resource}
                      resource={resource}
                      linkToEdit={props.linkToEdit}
                      label={`${t('more_actions')}`}
                    >
                      {props.customActions &&
                        props.customActions?.map((action: any) => {
                          return action(resource);
                        })}
                    </ResourcefulActions>
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
          totalRecords={data.data.meta.pagination.total}
        />
      )}
    </>
  );
}
