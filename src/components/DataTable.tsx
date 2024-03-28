/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, getEntityState, isProduction } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import React, {
  ChangeEvent,
  CSSProperties,
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from '$app/common/helpers/toast/toast';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Divider } from './cards/Divider';
import { Actions, SelectOption } from './datatables/Actions';
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
import { useSetAtom } from 'jotai';
import { Icon } from './icons/Icon';
import { MdArchive, MdDelete, MdEdit, MdRestore } from 'react-icons/md';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import CommonProps from '$app/common/interfaces/common-props.interface';
import classNames from 'classnames';
import { Guard } from '$app/common/guards/Guard';
import { EntityState } from '$app/common/enums/entity-state';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { refetchByUrl } from '$app/common/hooks/useRefetch';
import { useLocation } from 'react-router-dom';
import { useDataTableOptions } from '$app/common/hooks/useDataTableOptions';
import { useDataTableUtilities } from '$app/common/hooks/useDataTableUtilities';
import { useDataTablePreferences } from '$app/common/hooks/useDataTablePreferences';
import { DateRangePicker } from './datatables/DateRangePicker';
import { emitter } from '$app';
import { TFooter } from './tables/TFooter';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export interface DateRangeColumn {
  column: string;
  queryParameterKey: string;
}

export type DataTableColumns<T = any> = {
  id: string;
  label: string;
  format?: (field: string | number, resource: T) => unknown;
}[];

export type FooterColumns<T = any> = {
  id: string;
  label: string;
  format: (
    field: (string | number)[],
    resource: T[]
  ) => ReactNode | string | number;
}[];

type CustomBulkActionContext<T> = {
  selectedIds: string[];
  selectedResources: T[];
  setSelected: Dispatch<SetStateAction<string[]>>;
};

export type CustomBulkAction<T> = (
  ctx: CustomBulkActionContext<T>
) => ReactNode;

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
  customBulkActions?: CustomBulkAction<T>[];
  customFilters?: SelectOption[];
  customFilterPlaceholder?: string;
  withoutActions?: boolean;
  withoutPagination?: boolean;
  rightSide?: ReactNode;
  withoutPadding?: boolean;
  leftSideChevrons?: ReactNode;
  staleTime?: number;
  onTableRowClick?: (resource: T) => unknown;
  showRestore?: (resource: T) => boolean;
  showEdit?: (resource: T) => boolean;
  beforeFilter?: ReactNode;
  styleOptions?: StyleOptions;
  linkToCreateGuards?: Guard[];
  onBulkActionSuccess?: (
    resource: T[],
    action: 'archive' | 'delete' | 'restore'
  ) => void;
  onBulkActionCall?: (
    selectedIds: string[],
    action: 'archive' | 'restore' | 'delete'
  ) => void;
  hideEditableOptions?: boolean;
  dateRangeColumns?: DateRangeColumn[];
  excludeColumns?: string[];
  methodType?: 'GET' | 'POST';
  showArchive?: (resource: T) => boolean;
  showDelete?: (resource: T) => boolean;
  withoutDefaultBulkActions?: boolean;
  withoutStatusFilter?: boolean;
  queryIdentificator?: string;
  disableQuery?: boolean;
  footerColumns?: FooterColumns;
}

export type ResourceAction<T> = (resource: T) => ReactElement;

export type PerPage = '10' | '50' | '100';

export function DataTable<T extends object>(props: Props<T>) {
  const [t] = useTranslation();
  const location = useLocation();
  const options = useDataTableOptions();

  const reactSettings = useReactSettings();

  const [hasVerticalOverflow, setHasVerticalOverflow] =
    useState<boolean>(false);

  const [apiEndpoint, setApiEndpoint] = useState(
    new URL(endpoint(props.endpoint))
  );

  const tableKey = `${location.pathname}${props.endpoint.replace('.', '')}`;

  const setInvalidationQueryAtom = useSetAtom(invalidationQueryAtom);

  const {
    styleOptions,
    customFilters,
    onBulkActionCall,
    hideEditableOptions = false,
    dateRangeColumns = [],
    excludeColumns = [],
    methodType = 'GET',
    queryIdentificator,
    disableQuery,
    footerColumns = [],
  } = props;

  const companyUpdateTimeOut = useRef<NodeJS.Timeout | undefined>(undefined);

  const [filter, setFilter] = useState<string>('');
  const [customFilter, setCustomFilter] = useState<string[] | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<PerPage>(
    (apiEndpoint.searchParams.get('perPage') as PerPage) || '10'
  );
  const [sort, setSort] = useState<string>(
    apiEndpoint.searchParams.get('sort') || 'id|asc'
  );
  const [sortedBy, setSortedBy] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string[]>(['active']);
  const [dateRange, setDateRange] = useState<string>('');
  const [dateRangeQueryParameter, setDateRangeQueryParameter] =
    useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<T[]>([]);

  const [isInitialConfiguration, setIsInitialConfiguration] =
    useState<boolean>(true);

  const mainCheckbox = useRef<HTMLInputElement>(null);

  const { handleUpdateTableFilters } = useDataTablePreferences({
    apiEndpoint,
    isInitialConfiguration,
    customFilter,
    setCurrentPage,
    setCustomFilter,
    setFilter,
    setPerPage,
    setSort,
    setSortedBy,
    setStatus,
    tableKey,
    customFilters,
  });

  const {
    defaultOptions,
    defaultCustomFilterOptions,
    handleChangingCustomFilters,
  } = useDataTableUtilities({
    apiEndpoint,
    isInitialConfiguration,
    tableKey,
    customFilter,
    customFilters,
  });

  useEffect(() => {
    if (!isInitialConfiguration) {
      clearTimeout(companyUpdateTimeOut.current);

      const currentTimeout = setTimeout(
        () =>
          handleUpdateTableFilters(
            filter,
            sortedBy,
            sort,
            currentPage,
            status,
            perPage
          ),
        1500
      );

      companyUpdateTimeOut.current = currentTimeout;
    }

    apiEndpoint.searchParams.set('per_page', perPage);
    apiEndpoint.searchParams.set('page', currentPage.toString());
    apiEndpoint.searchParams.set('filter', filter);

    handleChangingCustomFilters();

    apiEndpoint.searchParams.set('sort', sort);
    apiEndpoint.searchParams.set('status', status as unknown as string);

    if (dateRangeColumns.length && dateRangeQueryParameter) {
      const startDate = dateRange?.split(',')[0];
      const endDate = dateRange?.split(',')[1];

      apiEndpoint.searchParams.set(
        dateRangeQueryParameter,
        startDate && endDate ? dateRange : ''
      );
    }

    setApiEndpoint(apiEndpoint);

    isInitialConfiguration && setIsInitialConfiguration(false);

    return () => {
      isProduction() && setInvalidationQueryAtom(undefined);
    };
  }, [
    perPage,
    currentPage,
    filter,
    sort,
    status,
    customFilter,
    dateRange,
    dateRangeQueryParameter,
  ]);

  const { data, isLoading, isError } = useQuery(
    [
      ...(queryIdentificator ? [queryIdentificator] : []),
      apiEndpoint.pathname,
      props.endpoint,
      perPage,
      currentPage,
      filter,
      sort,
      status,
      customFilter,
      dateRange,
      dateRangeQueryParameter,
    ],
    () => request(methodType, apiEndpoint.href),
    {
      staleTime: props.staleTime ?? Infinity,
      enabled: !disableQuery,
    }
  );

  const showRestoreBulkAction = () => {
    return selectedResources.every(
      (resource) => getEntityState(resource) !== EntityState.Active
    );
  };

  const bulk = (action: 'archive' | 'restore' | 'delete', id?: string) => {
    toast.processing();

    request('POST', endpoint(props.bulkRoute ?? `${props.endpoint}/bulk`), {
      action,
      ids: id ? [id] : Array.from(selected),
    })
      .then((response: GenericSingleResourceResponse<T[]>) => {
        toast.success(`${action}d_${props.resource}`);

        props.onBulkActionSuccess?.(response.data.data, action);

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
      .finally(() => {
        refetchByUrl([props.endpoint, apiEndpoint.pathname]);
        setSelected([]);
      });
  };

  const showCustomBulkActionDivider = useMemo(() => {
    return props.customBulkActions
      ? props.customBulkActions.some((action) =>
          React.isValidElement(
            action({
              selectedIds: selected,
              selectedResources,
              setSelected,
            })
          )
        )
      : false;
  }, [props.customBulkActions, selected, selectedResources]);

  const showCustomActionDivider = (resource: T) => {
    return props.customActions
      ? props.customActions.some((action: ResourceAction<T>) =>
          React.isValidElement(action(resource))
        )
      : false;
  };

  const handleDateRangeColumnClick = (columnId: string) => {
    const columnOfCurrentQueryParameter = dateRangeColumns.find(
      (dateRangeColumn) => dateRangeQueryParameter === dateRangeColumn.column
    )?.column;

    const queryParameterOfCurrentColumn = dateRangeColumns.find(
      (dateRangeColumn) => columnId === dateRangeColumn.column
    )?.queryParameterKey;

    columnOfCurrentQueryParameter !== columnId &&
      queryParameterOfCurrentColumn &&
      setDateRangeQueryParameter(queryParameterOfCurrentColumn);
  };

  const getFooterColumn = (columnId: string) => {
    return footerColumns.find((footerColumn) => footerColumn.id === columnId);
  };

  const getColumnValues = (columnId: string) => {
    return data?.data.data.map(
      (resource: T) => resource[columnId as keyof typeof resource]
    );
  };

  useEffect(() => {
    setInvalidationQueryAtom(apiEndpoint.pathname);
  }, [apiEndpoint.pathname]);

  useEffect(() => {
    if (data) {
      const filteredSelectedResources = data.data.data.filter((resource: any) =>
        selected.includes(resource.id)
      );

      setSelectedResources(filteredSelectedResources);
    }
  }, [selected]);

  useEffect(() => {
    if (data && !data.data.data.length) {
      setCurrentPage(1);
    }
  }, [data]);

  useEffect(() => {
    emitter.on('bulk.completed', () => setSelected([]));
  }, []);

  return (
    <div data-cy="dataTable">
      {!props.withoutActions && (
        <Actions
          filter={filter}
          onFilterChange={setFilter}
          optionsMultiSelect={true}
          options={options}
          defaultOptions={defaultOptions}
          defaultCustomFilterOptions={defaultCustomFilterOptions}
          onStatusChange={setStatus}
          customFilters={props.customFilters}
          customFilterPlaceholder={props.customFilterPlaceholder}
          onCustomFilterChange={setCustomFilter}
          rightSide={
            <>
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
            </>
          }
          beforeFilter={props.beforeFilter}
          withoutStatusFilter={props.withoutStatusFilter}
        >
          {!hideEditableOptions && (
            <Dropdown
              label={t('more_actions')}
              disabled={!selected.length}
              cypressRef="bulkActionsDropdown"
            >
              {props.customBulkActions &&
                props.customBulkActions.map(
                  (bulkAction: CustomBulkAction<T>, index: number) => (
                    <div key={index}>
                      {bulkAction({
                        selectedIds: selected,
                        selectedResources,
                        setSelected,
                      })}
                    </div>
                  )
                )}

              {props.customBulkActions && showCustomBulkActionDivider && (
                <Divider withoutPadding />
              )}

              {!props.withoutDefaultBulkActions && (
                <>
                  <DropdownElement
                    onClick={() => {
                      if (onBulkActionCall) {
                        onBulkActionCall(selected, 'archive');
                      } else {
                        bulk('archive');
                      }
                    }}
                    icon={<Icon element={MdArchive} />}
                  >
                    {t('archive')}
                  </DropdownElement>

                  <DropdownElement
                    onClick={() => {
                      if (onBulkActionCall) {
                        onBulkActionCall(selected, 'delete');
                      } else {
                        bulk('delete');
                      }
                    }}
                    icon={<Icon element={MdDelete} />}
                  >
                    {t('delete')}
                  </DropdownElement>

                  {showRestoreBulkAction() && (
                    <DropdownElement
                      onClick={() => {
                        if (onBulkActionCall) {
                          onBulkActionCall(selected, 'restore');
                        } else {
                          bulk('restore');
                        }
                      }}
                      icon={<Icon element={MdRestore} />}
                    >
                      {t('restore')}
                    </DropdownElement>
                  )}
                </>
              )}
            </Dropdown>
          )}
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
          {!props.withoutActions && !hideEditableOptions && (
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
                cypressRef="dataTableCheckbox"
              />
            </Th>
          )}

          {props.columns.map(
            (column, index) =>
              Boolean(!excludeColumns.includes(column.id)) && (
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
                  <div className="flex items-center space-x-3">
                    {dateRangeColumns.some(
                      (dateRangeColumn) => column.id === dateRangeColumn.column
                    ) && (
                      <DateRangePicker
                        setDateRange={setDateRange}
                        onClick={() => handleDateRangeColumnClick(column.id)}
                      />
                    )}
                    <span>{column.label}</span>
                  </div>
                </Th>
              )
          )}

          {props.withResourcefulActions && !hideEditableOptions && <Th></Th>}
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
              >
                {!props.withoutActions && !hideEditableOptions && (
                  <Td
                    className="cursor-pointer"
                    onClick={() =>
                      selected.includes(resource.id)
                        ? setSelected((current) =>
                            current.filter((v) => v !== resource.id)
                          )
                        : setSelected((current) => [...current, resource.id])
                    }
                  >
                    <Checkbox
                      checked={selected.includes(resource.id)}
                      className="child-checkbox"
                      value={resource.id}
                      id={resource.id}
                      cypressRef="dataTableCheckbox"
                    />
                  </Td>
                )}

                {props.columns.map(
                  (column, index) =>
                    Boolean(!excludeColumns.includes(column.id)) && (
                      <Td
                        key={index}
                        className={classNames(
                          {
                            'cursor-pointer': index < 3,
                            'py-4': hideEditableOptions,
                          },
                          styleOptions?.tdClassName
                        )}
                        onClick={() => {
                          if (index < 3) {
                            props.onTableRowClick
                              ? props.onTableRowClick(resource)
                              : document.getElementById(resource.id)?.click();
                          }
                        }}
                      >
                        {column.format
                          ? column.format(resource[column.id], resource)
                          : resource[column.id]}
                      </Td>
                    )
                )}

                {props.withResourcefulActions && !hideEditableOptions && (
                  <Td>
                    <Dropdown label={t('more_actions')}>
                      {props.linkToEdit &&
                        (props.showEdit?.(resource) || !props.showEdit) && (
                          <DropdownElement
                            to={route(props.linkToEdit, {
                              id: resource?.id,
                            })}
                            icon={<Icon element={MdEdit} />}
                          >
                            {t('edit')}
                          </DropdownElement>
                        )}

                      {props.linkToEdit &&
                        props.customActions &&
                        showCustomActionDivider(resource) &&
                        (props.showEdit?.(resource) || !props.showEdit) && (
                          <Divider withoutPadding />
                        )}

                      {props.customActions &&
                        props.customActions.map(
                          (
                            action: ResourceAction<typeof resource>,
                            index: number
                          ) =>
                            action(resource)?.key !== 'purge' && (
                              <div key={index}>{action(resource)}</div>
                            )
                        )}

                      {props.customActions &&
                        (props.showRestore?.(resource) ||
                          !props.showRestore) && <Divider withoutPadding />}

                      {resource?.archived_at === 0 &&
                        (props.showArchive?.(resource) ||
                          !props.showArchive) && (
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

                      {!resource?.is_deleted &&
                        (props.showDelete?.(resource) || !props.showDelete) && (
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
                            action(resource)?.key === 'purge' && (
                              <div key={index}>{action(resource)}</div>
                            )
                        )}
                    </Dropdown>
                  </Td>
                )}
              </Tr>
            ))}
        </Tbody>

        {Boolean(footerColumns.length) &&
          Boolean(data?.data.data.length) &&
          Boolean(reactSettings.show_table_footer) && (
            <TFooter>
              {!props.withoutActions && !hideEditableOptions && <Th></Th>}

              {props.columns.map(
                (column, index) =>
                  Boolean(!excludeColumns.includes(column.id)) && (
                    <Td key={index} customizeTextColor>
                      {getFooterColumn(column.id) ? (
                        <div className="flex items-center space-x-3">
                          {getFooterColumn(column.id)?.format(
                            getColumnValues(column.id) || [],
                            data?.data.data || []
                          ) ?? '-/-'}
                        </div>
                      ) : (
                        <></>
                      )}
                    </Td>
                  )
              )}

              {props.withResourcefulActions && !hideEditableOptions && (
                <Th></Th>
              )}
            </TFooter>
          )}
      </Table>

      {data && !props.withoutPagination && (
        <Pagination
          currentPerPage={perPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsChange={setPerPage}
          totalPages={data.data.meta.pagination.total_pages}
          totalRecords={data.data.meta.pagination.total}
          leftSideChevrons={props.leftSideChevrons}
        />
      )}
    </div>
  );
}
