/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint, isProduction } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import React, {
  ChangeEvent,
  CSSProperties,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from '$app/common/helpers/toast/toast';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Divider } from './cards/Divider';
import { Actions, SelectOption } from './datatables/Actions';
import { Dropdown } from './dropdown/Dropdown';
import { DropdownElement } from './dropdown/DropdownElement';
import { Button, Checkbox } from './forms';
import { Inline } from './Inline';
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
import { atomWithStorage } from 'jotai/utils';
import { useAtom, useSetAtom } from 'jotai';
import { Icon } from './icons/Icon';
import { MdArchive, MdDelete, MdEdit, MdRestore } from 'react-icons/md';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import CommonProps from '$app/common/interfaces/common-props.interface';
import classNames from 'classnames';
import { Guard } from '$app/common/guards/Guard';

export type DataTableColumns<T = any> = {
  id: string;
  label: string;
  format?: (field: string | number, resource: T) => unknown;
}[];

export type CustomBulkAction = (selectedIds: string[]) => ReactNode;

interface StyleOptions {
  withoutBottomBorder?: boolean;
  withoutTopBorder?: boolean;
  withoutLeftBorder?: boolean;
  withoutRightBorder?: boolean;
  headerBackgroundColor?: string;
  thChildrenClassName?: string;
  tBodyStyle?: CSSProperties;
  thClassName?: string;
  tdClassName?: string;
  addRowSeparator?: boolean;
}

interface Props<T> extends CommonProps {
  resource: string;
  columns: DataTableColumns;
  endpoint: string;
  linkToCreate?: string;
  linkToEdit?: string;
  withResourcefulActions?: ReactNode[] | boolean;
  bulkRoute?: string;
  customActions?: any;
  customBulkActions?: CustomBulkAction[];
  customFilters?: SelectOption[];
  customFilterQueryKey?: string;
  customFilterPlaceholder?: string;
  withoutActions?: boolean;
  withoutPagination?: boolean;
  rightSide?: ReactNode;
  withoutPadding?: boolean;
  leftSideChevrons?: ReactNode;
  staleTime?: number;
  onTableRowClick?: (resource: T) => unknown;
  showRestore?: (resource: T) => boolean;
  beforeFilter?: ReactNode;
  styleOptions?: StyleOptions;
  linkToCreateGuards?: Guard[];
}

type ResourceAction<T> = (resource: T) => ReactElement;

export const datatablePerPageAtom = atomWithStorage('perPage', '10');

export function DataTable<T extends object>(props: Props<T>) {
  const [t] = useTranslation();

  const [hasVerticalOverflow, setHasVerticalOverflow] =
    useState<boolean>(false);

  const [apiEndpoint, setApiEndpoint] = useState(
    new URL(endpoint(props.endpoint))
  );

  const setInvalidationQueryAtom = useSetAtom(invalidationQueryAtom);
  setInvalidationQueryAtom(apiEndpoint.pathname);

  const queryClient = useQueryClient();

  const { styleOptions } = props;

  const [filter, setFilter] = useState<string>('');
  const [customFilter, setCustomFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useAtom(datatablePerPageAtom);
  const [sort, setSort] = useState(
    apiEndpoint.searchParams.get('sort') || 'id|asc'
  );
  const [sortedBy, setSortedBy] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string[]>(['active']);
  const [selected, setSelected] = useState<string[]>([]);

  const mainCheckbox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const perPageParameter = apiEndpoint.searchParams.get('perPage');

    if (perPageParameter) {
      setPerPage(perPageParameter);
    }
  }, []);

  useEffect(() => {
    apiEndpoint.searchParams.set('per_page', perPage);
    apiEndpoint.searchParams.set('page', currentPage.toString());
    apiEndpoint.searchParams.set('filter', filter);
    if (props.customFilterQueryKey) {
      apiEndpoint.searchParams.set(
        props.customFilterQueryKey,
        customFilter.join(',')
      );
    }
    apiEndpoint.searchParams.set('sort', sort);
    apiEndpoint.searchParams.set('status', status as unknown as string);

    setApiEndpoint(apiEndpoint);

    return () => {
      isProduction() && setInvalidationQueryAtom(undefined);
    };
  }, [perPage, currentPage, filter, sort, status, customFilter]);

  const { data, isLoading, isError } = useQuery(
    [
      apiEndpoint.pathname,
      props.endpoint,
      perPage,
      currentPage,
      filter,
      sort,
      status,
      customFilter,
    ],
    () => request('GET', apiEndpoint.href),
    {
      staleTime: props.staleTime || 5000,
    }
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

  const bulk = (action: 'archive' | 'restore' | 'delete', id?: string) => {
    toast.processing();

    request('POST', endpoint(props.bulkRoute ?? `${props.endpoint}/bulk`), {
      action,
      ids: id ? [id] : Array.from(selected),
    })
      .then(() => {
        toast.success(`${action}d_${props.resource}`);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /** @ts-ignore: Unreachable, if element is null/undefined. */
        mainCheckbox.current.checked = false;

        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint(props.endpoint),
            },
          })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);
        console.error(error.response?.data);

        toast.error();
      })
      .finally(() => {
        queryClient.invalidateQueries([props.endpoint]);
        queryClient.invalidateQueries([apiEndpoint.pathname]);

        setSelected([]);
      });
  };

  return (
    <>
      {!props.withoutActions && (
        <Actions
          onFilterChange={setFilter}
          optionsMultiSelect={true}
          options={options}
          defaultOption={options[0]}
          onStatusChange={setStatus}
          customFilters={props.customFilters}
          customFilterQueryKey={props.customFilterQueryKey}
          customFilterPlaceholder={props.customFilterPlaceholder}
          onCustomFilterChange={setCustomFilter}
          rightSide={
            <Inline>
              {props.rightSide}

              {props.linkToCreate && (
                <Guard
                  type="component"
                  guards={props.linkToCreateGuards || []}
                  component={
                    <Button to={props.linkToCreate}>
                      <span>{t(`new_${props.resource}`)}</span>
                    </Button>
                  }
                />
              )}
            </Inline>
          }
          beforeFilter={props.beforeFilter}
        >
          <Dropdown label={t('more_actions')}>
            {props.customBulkActions &&
              props.customBulkActions.map(
                (bulkAction: CustomBulkAction, index: number) => (
                  <div key={index}>{bulkAction(selected)}</div>
                )
              )}

            {props.customBulkActions && <Divider withoutPadding />}

            <DropdownElement
              onClick={() => bulk('archive')}
              icon={<Icon element={MdArchive} />}
            >
              {t('archive')}
            </DropdownElement>

            <DropdownElement
              onClick={() => bulk('restore')}
              icon={<Icon element={MdRestore} />}
            >
              {t('restore')}
            </DropdownElement>

            <DropdownElement
              onClick={() => bulk('delete')}
              icon={<Icon element={MdDelete} />}
            >
              {t('delete')}
            </DropdownElement>
          </Dropdown>
        </Actions>
      )}

      <Table
        className={classNames(props.className, {
          'pr-0': !hasVerticalOverflow,
        })}
        withoutPadding={props.withoutPadding}
        withoutBottomBorder={styleOptions?.withoutBottomBorder}
        withoutTopBorder={styleOptions?.withoutTopBorder}
        withoutLeftBorder={styleOptions?.withoutLeftBorder}
        withoutRightBorder={styleOptions?.withoutRightBorder}
        onVerticalOverflowChange={(hasOverflow) =>
          setHasVerticalOverflow(hasOverflow)
        }
        isDataLoading={isLoading}
        style={props.style}
      >
        <Thead backgroundColor={styleOptions?.headerBackgroundColor}>
          {!props.withoutActions && (
            <Th className={styleOptions?.thClassName}>
              <Checkbox
                innerRef={mainCheckbox}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  Array.from(
                    document.querySelectorAll('.child-checkbox')
                  ).forEach((checkbox: HTMLInputElement | any) => {
                    checkbox.checked = event.target.checked;

                    event.target.checked
                      ? setSelected((current) => [...current, checkbox.id])
                      : setSelected((current) =>
                          current.filter((value) => value !== checkbox.id)
                        );
                  });
                }}
              />
            </Th>
          )}

          {props.columns.map((column, index) => (
            <Th
              id={column.id}
              key={index}
              className={styleOptions?.thClassName}
              isCurrentlyUsed={sortedBy === column.id}
              onColumnClick={(data: ColumnSortPayload) => {
                setSortedBy(data.field);
                setSort(data.sort);
              }}
              childrenClassName={styleOptions?.thChildrenClassName}
            >
              {column.label}
            </Th>
          ))}

          {props.withResourcefulActions && <Th></Th>}
        </Thead>

        <Tbody style={styleOptions?.tBodyStyle}>
          {isLoading && (
            <Tr
              className={classNames({
                'border-b border-gray-200': styleOptions?.addRowSeparator,
                'last:border-b-0': hasVerticalOverflow,
              })}
            >
              <Td colSpan={100}>
                <Spinner />
              </Td>
            </Tr>
          )}

          {isError && (
            <Tr
              className={classNames({
                'border-b border-gray-200': styleOptions?.addRowSeparator,
                'last:border-b-0': hasVerticalOverflow,
              })}
            >
              <Td className="text-center" colSpan={100}>
                {t('error_refresh_page')}
              </Td>
            </Tr>
          )}

          {data && data.data.data.length === 0 && (
            <Tr
              className={classNames({
                'border-b border-gray-200': styleOptions?.addRowSeparator,
                'last:border-b-0': hasVerticalOverflow,
              })}
            >
              <Td className={styleOptions?.tdClassName} colSpan={100}>
                {t('no_records_found')}
              </Td>
            </Tr>
          )}

          {data &&
            data?.data?.data?.map((resource: any, index: number) => (
              <Tr
                key={index}
                className={classNames({
                  'border-b border-gray-200': styleOptions?.addRowSeparator,
                  'last:border-b-0': hasVerticalOverflow,
                })}
                onClick={() =>
                  props.onTableRowClick
                    ? props.onTableRowClick(resource)
                    : document.getElementById(resource.id)?.click()
                }
              >
                {!props.withoutActions && (
                  <Td>
                    <Checkbox
                      checked={selected.includes(resource.id)}
                      className="child-checkbox"
                      value={resource.id}
                      id={resource.id}
                      onValueChange={(value) =>
                        selected.includes(value)
                          ? setSelected((current) =>
                              current.filter((v) => v !== value)
                            )
                          : setSelected((current) => [...current, value])
                      }
                    />
                  </Td>
                )}

                {props.columns.map((column, index) => (
                  <Td key={index} className={styleOptions?.tdClassName}>
                    {column.format
                      ? column.format(resource[column.id], resource)
                      : resource[column.id]}
                  </Td>
                ))}

                {props.withResourcefulActions && (
                  <Td>
                    <Dropdown label={t('more_actions')}>
                      {props.linkToEdit && (
                        <DropdownElement
                          to={route(props.linkToEdit, {
                            id: resource?.id,
                          })}
                          icon={<Icon element={MdEdit} />}
                        >
                          {t('edit')}
                        </DropdownElement>
                      )}

                      {props.linkToEdit && props.customActions && (
                        <Divider withoutPadding />
                      )}

                      {props.customActions &&
                        props.customActions.map(
                          (
                            action: ResourceAction<typeof resource>,
                            index: number
                          ) =>
                            action(resource).key !== 'purge' && (
                              <div key={index}>{action(resource)}</div>
                            )
                        )}

                      {props.customActions &&
                        (props.showRestore?.(resource) ||
                          !props.showRestore) && <Divider withoutPadding />}

                      {resource?.archived_at === 0 && (
                        <DropdownElement
                          onClick={() => bulk('archive', resource.id)}
                          icon={<Icon element={MdArchive} />}
                        >
                          {t('archive')}
                        </DropdownElement>
                      )}

                      {resource?.archived_at > 0 &&
                        (props.showRestore?.(resource) ||
                          !props.showRestore) && (
                          <DropdownElement
                            onClick={() => bulk('restore', resource.id)}
                            icon={<Icon element={MdRestore} />}
                          >
                            {t('restore')}
                          </DropdownElement>
                        )}

                      {!resource?.is_deleted && (
                        <DropdownElement
                          onClick={() => bulk('delete', resource.id)}
                          icon={<Icon element={MdDelete} />}
                        >
                          {t('delete')}
                        </DropdownElement>
                      )}

                      {props.customActions &&
                        props.customActions.map(
                          (
                            action: ResourceAction<typeof resource>,
                            index: number
                          ) =>
                            action(resource).key === 'purge' && (
                              <div key={index}>{action(resource)}</div>
                            )
                        )}
                    </Dropdown>
                  </Td>
                )}
              </Tr>
            ))}
        </Tbody>
      </Table>

      {data && !props.withoutPagination && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsChange={setPerPage}
          totalPages={data.data.meta.pagination.total_pages}
          totalRecords={data.data.meta.pagination.total}
          leftSideChevrons={props.leftSideChevrons}
        />
      )}
    </>
  );
}
