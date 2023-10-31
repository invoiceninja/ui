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
import { EntityState } from '$app/common/enums/entity-state';
import collect from 'collect.js';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { PasswordConfirmation } from './PasswordConfirmation';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';

export type DataTableColumns<T = any> = {
  id: string;
  label: string;
  format?: (field: string | number, resource: T) => unknown;
}[];

export type CustomBulkAction<T> = (
  selectedIds: string[],
  selectedResources?: T[],
  setSelected?: Dispatch<SetStateAction<string[]>>
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
  passwordProtectedBulkActions?: boolean;
}

type ResourceAction<T> = (resource: T) => ReactElement;

export const datatablePerPageAtom = atomWithStorage('perPage', '100');

export function DataTable<T extends object>(props: Props<T>) {
  const [t] = useTranslation();

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);
  const [action, setAction] = useState<'archive' | 'restore' | 'delete'>();

  const [hasVerticalOverflow, setHasVerticalOverflow] =
    useState<boolean>(false);

  const [apiEndpoint, setApiEndpoint] = useState(
    new URL(endpoint(props.endpoint))
  );

  const setInvalidationQueryAtom = useSetAtom(invalidationQueryAtom);
  setInvalidationQueryAtom(apiEndpoint.pathname);

  const queryClient = useQueryClient();

  const { styleOptions, customFilters } = props;

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
  const [selectedResources, setSelectedResources] = useState<T[]>([]);

  const mainCheckbox = useRef<HTMLInputElement>(null);

  const handleChangingCustomFilters = () => {
    if (customFilters) {
      const queryKeys: string[] = collect(props.customFilters)
        .pluck('queryKey')
        .unique()
        .toArray();

      queryKeys.forEach((queryKey) => {
        const currentQueryKey = queryKey || 'client_status';
        const selectedFiltersByKey: string[] = [];

        customFilters.forEach((filter, index) => {
          const customFilterQueryKey = filter.queryKey || null;

          if (
            customFilterQueryKey === queryKey &&
            customFilter.includes(filter.value)
          ) {
            selectedFiltersByKey.push(filter.value);
          }

          if (index === customFilters.length - 1) {
            apiEndpoint.searchParams.set(
              currentQueryKey,
              selectedFiltersByKey.join(',')
            );
          }
        });
      });
    }
  };

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

    handleChangingCustomFilters();

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

  const showRestoreBulkAction = () => {
    return selectedResources.every(
      (resource) => getEntityState(resource) !== EntityState.Active
    );
  };

  const bulk = (
    currentAction: 'archive' | 'restore' | 'delete',
    id?: string,
    password?: string
  ) => {
    toast.processing();

    request(
      'POST',
      endpoint(props.bulkRoute ?? `${props.endpoint}/bulk`),
      {
        action: currentAction,
        ids: id ? [id] : Array.from(selected),
      },
      {
        ...(password &&
          props.passwordProtectedBulkActions && {
            headers: { 'X-Api-Password': password },
          }),
      }
    )
      .then((response: GenericSingleResourceResponse<T[]>) => {
        toast.success(`${currentAction}d_${props.resource}`);

        props.onBulkActionSuccess?.(response.data.data, currentAction);

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
      .catch((error: AxiosError<ValidationBag>) => {
        toast.dismiss();

        if (error.response?.status === 401) {
          toast.error(error.response?.data.message);
        }

        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        }
      })
      .finally(() => {
        queryClient.invalidateQueries([props.endpoint]);
        queryClient.invalidateQueries([apiEndpoint.pathname]);

        setSelected([]);
      });
  };

  const showCustomBulkActionDivider = useMemo(() => {
    return props.customBulkActions
      ? props.customBulkActions.some((action) =>
          React.isValidElement(action(selected, selectedResources))
        )
      : false;
  }, [props.customBulkActions, selected, selectedResources]);

  useEffect(() => {
    if (data) {
      const filteredSelectedResources = data.data.data.filter((resource: any) =>
        selected.includes(resource.id)
      );

      setSelectedResources(filteredSelectedResources);
    }
  }, [selected]);

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
          <Dropdown label={t('more_actions')} disabled={!selected.length}>
            {props.customBulkActions &&
              props.customBulkActions.map(
                (bulkAction: CustomBulkAction<T>, index: number) => (
                  <div key={index}>
                    {bulkAction(selected, selectedResources, setSelected)}
                  </div>
                )
              )}

            {props.customBulkActions && showCustomBulkActionDivider && (
              <Divider withoutPadding />
            )}

            <DropdownElement
              onClick={() => {
                if (props.passwordProtectedBulkActions) {
                  setAction('archive');
                  setIsPasswordConfirmModalOpen(true);
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
                if (props.passwordProtectedBulkActions) {
                  setAction('delete');
                  setIsPasswordConfirmModalOpen(true);
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
                  if (props.passwordProtectedBulkActions) {
                    setAction('restore');
                    setIsPasswordConfirmModalOpen(true);
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
              >
                {!props.withoutActions && (
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
                    />
                  </Td>
                )}

                {props.columns.map((column, index) => (
                  <Td
                    key={index}
                    className={classNames(
                      {
                        'cursor-pointer': index < 3,
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
                ))}

                {props.withResourcefulActions && (
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
                        (props.showEdit?.(resource) || !props.showEdit) && (
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

      {props.passwordProtectedBulkActions && (
        <PasswordConfirmation
          show={isPasswordConfirmModalOpen}
          onClose={setIsPasswordConfirmModalOpen}
          onSave={(password) => action && bulk(action, '', password)}
          tableActions
        />
      )}
    </>
  );
}
