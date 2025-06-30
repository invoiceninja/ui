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
  CSSProperties,
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useCallback,
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
  MemoizedTr,
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from './tables';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Icon } from './icons/Icon';
import { MdArchive, MdDelete, MdEdit, MdRestore } from 'react-icons/md';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import CommonProps from '$app/common/interfaces/common-props.interface';
import classNames from 'classnames';
import { Guard } from '$app/common/guards/Guard';
import { EntityState } from '$app/common/enums/entity-state';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { refetchByUrl } from '$app/common/hooks/useRefetch';
import { useDataTableOptions } from '$app/common/hooks/useDataTableOptions';
import { useDataTableUtilities } from '$app/common/hooks/useDataTableUtilities';
import { useDataTablePreferences } from '$app/common/hooks/useDataTablePreferences';
import { DateRangePicker } from './datatables/DateRangePicker';
import { emitter } from '$app';
import { TFooter } from './tables/TFooter';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useColorScheme } from '$app/common/colors';
import { useDebounce } from 'react-use';
import { isEqual } from 'lodash';

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
  thStyle?: CSSProperties;
  withoutThVerticalPadding?: boolean;
  useOnlyCurrentSortDirectionIcon?: boolean;
  thTextSize?: 'extraSmall' | 'small';
  disableThUppercase?: boolean;
  descIcon?: ReactNode;
  ascIcon?: ReactNode;
  withoutTdPadding?: boolean;
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
  bottomActionsKeys?: string[];
  customBulkActions?: CustomBulkAction<T>[];
  customFilters?: SelectOption[];
  customFilterPlaceholder?: string;
  withoutActions?: boolean;
  withoutPagination?: boolean;
  rightSide?: ReactNode;
  withoutPadding?: boolean;
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
  withoutPerPageAsPreference?: boolean;
  withoutSortQueryParameter?: boolean;
  showRestoreBulk?: (selectedResources: T[]) => boolean;
  enableSavingFilterPreference?: boolean;
  applyManualHeight?: boolean;
  onDeleteBulkAction?: (selectedIds: string[]) => void;
}

export type ResourceAction<T> = (resource: T) => ReactElement;

export type PerPage = '10' | '50' | '100';

export const dataTableSelectedAtom = atom<Record<string, string[]>>({});

function DataTableCheckbox({
  resourceId,
  resource,
  dataLength,
}: {
  resourceId?: string;
  resource: string;
  dataLength?: number;
}) {
  const selected = useAtomValue(dataTableSelectedAtom);

  if (resourceId) {
    return (
      <Checkbox
        checked={selected?.[resource]?.includes(resourceId)}
        className="child-checkbox"
        value={resourceId}
        id={resourceId}
        cypressRef="dataTableCheckbox"
      />
    );
  }

  return (
    <Checkbox
      checked={selected?.[resource]?.length === dataLength && dataLength > 0}
    />
  );
}

export function DataTable<T extends object>(props: Props<T>) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const options = useDataTableOptions();
  const reactSettings = useReactSettings();

  const [apiEndpoint, setApiEndpoint] = useState(
    new URL(endpoint(props.endpoint))
  );

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
    bottomActionsKeys = [],
    withoutPerPageAsPreference = false,
    withoutSortQueryParameter = false,
    showRestoreBulk,
    enableSavingFilterPreference = false,
    onDeleteBulkAction,
  } = props;

  const companyUpdateTimeOut = useRef<NodeJS.Timeout | undefined>(undefined);

  const [filter, setFilter] = useState<string>('');
  const [customFilter, setCustomFilter] = useState<string[] | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<PerPage>(
    (apiEndpoint.searchParams.get('per_page') as PerPage) || '10'
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
  const setGlobalSelected = useSetAtom(dataTableSelectedAtom);

  const [isInitialConfiguration, setIsInitialConfiguration] =
    useState<boolean>(true);
  const [arePreferencesApplied, setArePreferencesApplied] =
    useState<boolean>(false);
  const [currentData, setCurrentData] = useState<T[]>([]);
  const [areRowsRendered, setAreRowsRendered] = useState<boolean>(false);

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
    setArePreferencesApplied,
    tableKey: `${props.resource}s`,
    customFilters,
    withoutStoringPerPage: withoutPerPageAsPreference,
    enableSavingFilterPreference,
  });

  const {
    defaultOptions,
    defaultCustomFilterOptions,
    handleChangingCustomFilters,
  } = useDataTableUtilities({
    apiEndpoint,
    isInitialConfiguration,
    tableKey: `${props.resource}s`,
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

    if (
      !withoutSortQueryParameter ||
      (withoutSortQueryParameter && sort !== 'id|asc')
    ) {
      apiEndpoint.searchParams.set('sort', sort);
    }

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

  useEffect(() => {
    setGlobalSelected((current) => ({
      ...current,
      [props.resource]: selected,
    }));

    currentData.forEach((resource: any) => {
      const row = document.querySelector(
        `tr[row-id="${resource.id}"]`
      ) as HTMLElement;

      if (row) {
        if (selected.includes(resource.id)) {
          row.style.backgroundColor = colors.$7;
        } else {
          row.style.backgroundColor = 'transparent';
        }
      }
    });
  }, [selected, props.resource]);

  useEffect(() => {
    return () => {
      setSelected([]);
      setGlobalSelected((current) => ({
        ...current,
        [props.resource]: [],
      }));
    };
  }, []);

  const { data, isLoading, isFetching, isError } = useQuery(
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
      enabled: !disableQuery && arePreferencesApplied,
    }
  );

  const selectedResources = useMemo(() => {
    if (!selected?.length) return [];

    return (
      currentData.filter((resource: T) =>
        selected?.includes(resource?.['id' as keyof T] as string)
      ) || []
    );
  }, [currentData, selected]);

  const showRestoreBulkAction = () => {
    return selectedResources.every(
      (resource: T) => getEntityState(resource) !== EntityState.Active
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
      (dateRangeColumn) =>
        dateRangeQueryParameter === dateRangeColumn.queryParameterKey
    )?.column;

    const queryParameterOfCurrentColumn = dateRangeColumns.find(
      (dateRangeColumn) => columnId === dateRangeColumn.column
    )?.queryParameterKey;

    if (
      columnOfCurrentQueryParameter !== columnId &&
      queryParameterOfCurrentColumn
    ) {
      setDateRangeQueryParameter(queryParameterOfCurrentColumn);
    }
  };

  const getFooterColumn = (columnId: string) => {
    return footerColumns.find((footerColumn) => footerColumn.id === columnId);
  };

  const getColumnValues = (columnId: string) => {
    return currentData.map(
      (resource: T) => resource[columnId as keyof typeof resource]
    );
  };

  const handleCheckboxClick = useCallback(
    (id: string) => {
      setSelected((current) =>
        current.includes(id)
          ? current.filter((v) => v !== id)
          : [...current, id]
      );
    },
    [selected]
  );

  const handleAllCheckboxClick = useCallback(() => {
    if (currentData.length === 0) {
      setSelected([]);
    } else if (
      selected.length === currentData.length &&
      currentData.length > 0
    ) {
      setSelected([]);
    } else {
      setSelected(currentData.map((resource: any) => resource.id) || []);
    }
  }, [selected, currentData]);

  useEffect(() => {
    setInvalidationQueryAtom(apiEndpoint.pathname);
  }, [apiEndpoint.pathname]);

  useDebounce(
    () => {
      if (data && !isFetching) {
        setCurrentData(data.data.data);
      }
    },
    10,
    [data, isFetching]
  );

  useEffect(() => {
    if (isLoading) {
      setCurrentData([]);
    }
  }, [isLoading]);

  useEffect(() => {
    setAreRowsRendered(false);
  }, [
    queryIdentificator,
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
  ]);

  useEffect(() => {
    if (isFetching || isLoading) {
      setAreRowsRendered(false);
      setCurrentData([]);
    }
  }, [isFetching, isLoading]);

  useEffect(() => {
    setAreRowsRendered(false);
  }, [data]);

  useEffect(() => {
    if (!currentData.length) {
      setCurrentPage(1);
    }

    if (perPage === '10') {
      setAreRowsRendered(true);
    }

    if (perPage === '50') {
      setTimeout(() => {
        setAreRowsRendered(true);
      }, 50);
    }

    if (perPage === '100') {
      setTimeout(() => {
        setAreRowsRendered(true);
      }, 150);
    }
  }, [currentData]);

  useEffect(() => {
    if (
      Number(perPage) < selected.length ||
      Number(perPage) === selected.length
    ) {
      setSelected(
        currentData
          .map((resource: any) => resource.id)
          .filter((resourceId: string) => selected.includes(resourceId)) || []
      );
    }
  }, [currentData, perPage]);

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
          customFilter={customFilter}
          rightSide={
            <>
              {props.rightSide}

              {props.linkToCreate && (
                <Guard
                  type="component"
                  guards={props.linkToCreateGuards || []}
                  component={
                    <Button to={props.linkToCreate} className="shadow-sm">
                      {t(`new_${props.resource}`)}
                    </Button>
                  }
                />
              )}
            </>
          }
          beforeFilter={props.beforeFilter}
          withoutStatusFilter={props.withoutStatusFilter}
        >
          {Boolean(!hideEditableOptions && selectedResources.length) && (
            <Dropdown
              label={t('actions')}
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
              )}

              {!props.withoutDefaultBulkActions && (
                <DropdownElement
                  onClick={() => {
                    if (onDeleteBulkAction) {
                      onDeleteBulkAction(selected);
                    } else if (onBulkActionCall) {
                      onBulkActionCall(selected, 'delete');
                    } else {
                      bulk('delete');
                    }
                  }}
                  icon={<Icon element={MdDelete} />}
                >
                  {t('delete')}
                </DropdownElement>
              )}

              {!props.withoutDefaultBulkActions &&
                (showRestoreBulk
                  ? showRestoreBulk(selectedResources)
                  : showRestoreBulkAction()) && (
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
            </Dropdown>
          )}
        </Actions>
      )}

      <Table
        className={props.className}
        withoutPadding={props.withoutPadding}
        withoutBottomBorder={styleOptions?.withoutBottomBorder}
        withoutTopBorder={styleOptions?.withoutTopBorder}
        withoutLeftBorder={styleOptions?.withoutLeftBorder}
        withoutRightBorder={styleOptions?.withoutRightBorder}
        isDataLoading={isLoading}
        style={props.style}
        resizable={apiEndpoint.pathname}
      >
        <Thead
          backgroundColor={styleOptions?.headerBackgroundColor}
          style={styleOptions?.thStyle}
        >
          {!props.withoutActions && !hideEditableOptions && (
            <Th
              className={styleOptions?.thClassName}
              resizable={`${apiEndpoint.pathname}.leftCheckbox`}
              withoutVerticalPadding={styleOptions?.withoutThVerticalPadding}
              textSize={styleOptions?.thTextSize}
              disableUppercase={styleOptions?.disableThUppercase}
              onClick={handleAllCheckboxClick}
            >
              <DataTableCheckbox
                resource={props.resource}
                dataLength={currentData.length}
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
                  resizable={`${apiEndpoint.pathname}.${column.id}`}
                  useOnlyCurrentSortDirectionIcon={
                    styleOptions?.useOnlyCurrentSortDirectionIcon
                  }
                  textSize={styleOptions?.thTextSize}
                  disableUppercase={styleOptions?.disableThUppercase}
                  descIcon={styleOptions?.descIcon}
                  ascIcon={styleOptions?.ascIcon}
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

        <Tbody
          style={{
            ...styleOptions?.tBodyStyle,
            opacity: areRowsRendered || !currentData.length ? 1 : 0.5,
            pointerEvents:
              areRowsRendered || !currentData.length ? 'auto' : 'none',
            cursor:
              areRowsRendered || !currentData.length ? 'default' : 'progress',
          }}
        >
          {(isLoading || !isEqual(currentData, data?.data?.data)) && (
            <MemoizedTr
              className="border-b"
              style={{
                borderColor: colors.$20,
              }}
            >
              <Td colSpan={100}>
                <Spinner />
              </Td>
            </MemoizedTr>
          )}

          {isError && !isLoading && (
            <MemoizedTr
              className="border-b"
              style={{
                borderColor: colors.$20,
              }}
            >
              <Td className="text-center" colSpan={100}>
                {t('error_refresh_page')}
              </Td>
            </MemoizedTr>
          )}

          {!isLoading &&
            currentData?.length === 0 &&
            isEqual(currentData, data?.data?.data) && (
              <MemoizedTr
                className="border-b"
                style={{
                  borderColor: colors.$20,
                }}
              >
                <Td className={styleOptions?.tdClassName} colSpan={100}>
                  <div className="flex items-center justify-center py-10">
                    <span className="text-sm" style={{ color: colors.$17 }}>
                      {t('no_records_found')}
                    </span>
                  </div>
                </Td>
              </MemoizedTr>
            )}

          {isEqual(currentData, data?.data?.data) &&
            currentData.map((resource: any, rowIndex: number) => (
              <MemoizedTr
                key={rowIndex}
                className="border-b table-row"
                style={{
                  borderColor: colors.$20,
                }}
                resource={resource}
                memoValue={props.columns}
                withoutBackgroundColor
              >
                {!props.withoutActions && !hideEditableOptions && (
                  <Td
                    className="cursor-pointer"
                    onClick={() => handleCheckboxClick(resource.id)}
                  >
                    <DataTableCheckbox
                      resourceId={resource.id}
                      resource={props.resource}
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
                        withoutPadding={styleOptions?.withoutTdPadding}
                        resizable={`${apiEndpoint.pathname}.${column.id}`}
                      >
                        {column.format
                          ? column.format(resource[column.id], resource)
                          : resource[column.id]}
                      </Td>
                    )
                )}

                {props.withResourcefulActions && !hideEditableOptions && (
                  <Td>
                    <Dropdown label={t('actions')}>
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
                            !bottomActionsKeys.includes(
                              action(resource)?.key || ''
                            ) && <div key={index}>{action(resource)}</div>
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
                            bottomActionsKeys.includes(
                              action(resource)?.key || ''
                            ) && <div key={index}>{action(resource)}</div>
                        )}
                    </Dropdown>
                  </Td>
                )}
              </MemoizedTr>
            ))}
        </Tbody>

        {Boolean(footerColumns.length) &&
          Boolean(currentData?.length) &&
          Boolean(reactSettings.show_table_footer) && (
            <TFooter>
              {!props.withoutActions && !hideEditableOptions && <Th></Th>}

              {props.columns.map(
                (column, index) =>
                  Boolean(!excludeColumns.includes(column.id)) && (
                    <Td
                      key={index}
                      customizeTextColor
                      resizable={`${apiEndpoint.pathname}.${column.id}`}
                    >
                      {getFooterColumn(column.id) ? (
                        <div className="flex items-center space-x-3">
                          {getFooterColumn(column.id)?.format(
                            getColumnValues(column.id) as (string | number)[],
                            currentData || []
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
        />
      )}
    </div>
  );
}
