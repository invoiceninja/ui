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
import { RecurringInvoiceStatus } from '$app/common/enums/recurring-invoice-status';
import { RecurringInvoiceStatus as RecurringInvoiceStatusBadge } from '../common/components/RecurringInvoiceStatus';
import { date, endpoint, getEntityState } from '$app/common/helpers';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Client } from '$app/common/interfaces/client';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Invitation } from '$app/common/interfaces/purchase-order';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Action } from '$app/components/ResourceActions';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { invoiceSumAtom, recurringInvoiceAtom } from './atoms';
import { route } from '$app/common/helpers/route';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { StatusBadge } from '$app/components/StatusBadge';
import recurringInvoicesFrequency from '$app/common/constants/recurring-invoices-frequency';
import { EntityStatus } from '$app/components/EntityStatus';
import { SelectOption } from '$app/components/datatables/Actions';
import { Icon } from '$app/components/icons/Icon';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdEdit,
  MdNotStarted,
  MdPictureAsPdf,
  MdRestore,
  MdStopCircle,
} from 'react-icons/md';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { Tooltip } from '$app/components/Tooltip';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useBulkAction } from '$app/pages/recurring-invoices/common/queries';
import { EntityState } from '$app/common/enums/entity-state';
import { isDeleteActionTriggeredAtom } from '$app/pages/invoices/common/components/ProductsTable';

import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { UpdatePricesAction } from './components/UpdatePricesAction';
import { IncreasePricesAction } from './components/IncreasePricesAction';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { CloneOptionsModal } from './components/CloneOptionsModal';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useDateTime } from '$app/common/hooks/useDateTime';

interface RecurringInvoiceUtilitiesProps {
  client?: Client;
}

export type ChangeHandler = <T extends keyof RecurringInvoice>(
  property: T,
  value: RecurringInvoice[typeof property]
) => void;

export function useRecurringInvoiceUtilities(
  props: RecurringInvoiceUtilitiesProps
) {
  const currencyResolver = useResolveCurrency();
  const company = useCurrentCompany();

  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [, setInvoiceSum] = useAtom(invoiceSumAtom);

  const handleChange: ChangeHandler = (property, value) => {
    setRecurringInvoice(
      (current) => current && { ...current, [property]: value }
    );
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...recurringInvoice!.invitations];

    const potential =
      invitations?.find((invitation) => invitation.client_contact_id === id) ||
      -1;

    if (potential !== -1 && checked === false) {
      invitations = invitations.filter((i) => i.client_contact_id !== id);
    }

    if (potential === -1) {
      const invitation: Partial<Invitation> = {
        client_contact_id: id,
      };

      invitations.push(invitation as Invitation);
    }

    handleChange('invitations', invitations);
  };

  const handleLineItemChange = (index: number, lineItem: InvoiceItem) => {
    const lineItems = recurringInvoice?.line_items || [];

    lineItems[index] = lineItem;

    setRecurringInvoice(
      (recurringInvoice) =>
        recurringInvoice && { ...recurringInvoice, line_items: lineItems }
    );
  };

  const handleLineItemPropertyChange = (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => {
    const lineItems = recurringInvoice?.line_items || [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItems[index][key] = value;

    setRecurringInvoice(
      (recurringInvoice) =>
        recurringInvoice && { ...recurringInvoice, line_items: lineItems }
    );
  };

  const handleCreateLineItem = (typeId: InvoiceItemType) => {
    setRecurringInvoice(
      (recurringInvoice) =>
        recurringInvoice && {
          ...recurringInvoice,
          line_items: [
            ...recurringInvoice.line_items,
            { ...blankLineItem(), type_id: typeId },
          ],
        }
    );
  };

  const handleDeleteLineItem = (index: number) => {
    const lineItems = recurringInvoice?.line_items || [];

    lineItems.splice(index, 1);

    setRecurringInvoice(
      (recurringInvoice) =>
        recurringInvoice && { ...recurringInvoice, line_items: lineItems }
    );
  };

  const calculateInvoiceSum = (recurringInvoice: RecurringInvoice) => {
    const currency = currencyResolver(
      props.client?.settings.currency_id || company?.settings.currency_id
    );

    if (currency && recurringInvoice) {
      const invoiceSum = recurringInvoice.uses_inclusive_taxes
        ? new InvoiceSumInclusive(recurringInvoice, currency).build()
        : new InvoiceSum(recurringInvoice, currency).build();

      setInvoiceSum(invoiceSum);
    }
  };

  return {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  };
}

interface RecurringInvoiceSaveProps {
  setErrors: (errors: ValidationBag | undefined) => unknown;
}

export function useSave(props: RecurringInvoiceSaveProps) {
  const { setErrors } = props;

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return (
    recurringInvoice: RecurringInvoice,
    queryAction?: 'send_now' | 'start'
  ) => {
    toast.processing();
    setErrors(undefined);

    const endpointUrl = queryAction
      ? `/api/v1/recurring_invoices/:id?${queryAction}=true`
      : '/api/v1/recurring_invoices/:id';

    request(
      'PUT',
      endpoint(endpointUrl, { id: recurringInvoice.id }),
      recurringInvoice
    )
      .then(() => {
        $refetch(['recurring_invoices']);

        toast.success('updated_recurring_invoice');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}

export function useToggleStartStop() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (recurringInvoice: RecurringInvoice, action: 'start' | 'stop') => {
    toast.processing();

    const url =
      action === 'start'
        ? '/api/v1/recurring_invoices/:id?start=true'
        : '/api/v1/recurring_invoices/:id?stop=true';

    request(
      'PUT',
      endpoint(url, { id: recurringInvoice.id }),
      recurringInvoice
    ).then(() => {
      $refetch(['recurring_invoices']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);

      toast.success(
        action === 'start'
          ? 'started_recurring_invoice'
          : 'stopped_recurring_invoice'
      );
    });
  };
}

interface Params {
  showEditAction?: boolean;
  showCommonBulkActions?: boolean;
}

export function useActions(params?: Params) {
  const [t] = useTranslation();

  const bulk = useBulkAction();
  const navigate = useNavigate();
  const hasPermission = useHasPermission();
  const toggleStartStop = useToggleStartStop();

  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);

  const { showEditAction, showCommonBulkActions } = params || {};

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'recurring_invoice',
  });

  const cloneToRecurringInvoice = (recurringInvoice: RecurringInvoice) => {
    setRecurringInvoice({
      ...recurringInvoice,
      id: '',
      documents: [],
      number: '',
    });

    navigate('/recurring_invoices/create?action=clone');
  };

  const actions: Action<RecurringInvoice>[] = [
    (recurringInvoice) =>
      Boolean(showEditAction) && (
        <DropdownElement
          to={route('/recurring_invoices/:id/edit', {
            id: recurringInvoice.id,
          })}
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    () => Boolean(showEditAction) && <Divider withoutPadding />,
    (recurringInvoice) => (
      <DropdownElement
        to={route('/recurring_invoices/:id/pdf', {
          id: recurringInvoice.id,
        })}
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_pdf')}
      </DropdownElement>
    ),
    (recurringInvoice) =>
      (recurringInvoice.status_id === RecurringInvoiceStatus.DRAFT ||
        recurringInvoice.status_id === RecurringInvoiceStatus.PAUSED) && (
        <DropdownElement
          onClick={() => toggleStartStop(recurringInvoice, 'start')}
          icon={<Icon element={MdNotStarted} />}
        >
          {t('start')}
        </DropdownElement>
      ),
    (recurringInvoice) =>
      recurringInvoice.status_id === RecurringInvoiceStatus.ACTIVE && (
        <DropdownElement
          onClick={() => toggleStartStop(recurringInvoice, 'stop')}
          icon={<Icon element={MdStopCircle} />}
        >
          {t('stop')}
        </DropdownElement>
      ),
    (recurringInvoice) =>
      !recurringInvoice.is_deleted && (
        <UpdatePricesAction selectedIds={[recurringInvoice.id]} />
      ),
    (recurringInvoice) =>
      !recurringInvoice.is_deleted && (
        <IncreasePricesAction selectedIds={[recurringInvoice.id]} />
      ),
    () => <Divider withoutPadding />,
    (recurringInvoice) =>
      hasPermission('create_recurring_invoice') && (
        <DropdownElement
          onClick={() => cloneToRecurringInvoice(recurringInvoice)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone_to_recurring')}
        </DropdownElement>
      ),
    (recurringInvoice) => (
      <CloneOptionsModal recurringInvoice={recurringInvoice} />
    ),
    () =>
      (isEditPage || Boolean(showCommonBulkActions)) && (
        <Divider withoutPadding />
      ),
    (recurringInvoice) =>
      (isEditPage || Boolean(showCommonBulkActions)) &&
      getEntityState(recurringInvoice) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([recurringInvoice.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (recurringInvoice) =>
      (isEditPage || Boolean(showCommonBulkActions)) &&
      (getEntityState(recurringInvoice) === EntityState.Archived ||
        getEntityState(recurringInvoice) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([recurringInvoice.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (recurringInvoice) =>
      (isEditPage || Boolean(showCommonBulkActions)) &&
      (getEntityState(recurringInvoice) === EntityState.Active ||
        getEntityState(recurringInvoice) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([recurringInvoice.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

export function useCreate({ setErrors }: RecurringInvoiceSaveProps) {
  const navigate = useNavigate();

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return (
    recurringInvoice: RecurringInvoice,
    queryAction?: 'start' | 'send_now'
  ) => {
    setErrors(undefined);
    toast.processing();

    const endpointUrl = queryAction
      ? `/api/v1/recurring_invoices?${queryAction}=true`
      : '/api/v1/recurring_invoices';

    request('POST', endpoint(endpointUrl), recurringInvoice)
      .then((response: GenericSingleResourceResponse<RecurringInvoice>) => {
        toast.success('created_recurring_invoice');

        $refetch(['recurring_invoices']);

        navigate(
          route('/recurring_invoices/:id/edit', {
            id: response.data.data.id,
          })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}

export const defaultColumns: string[] = [
  'status',
  'number',
  'client',
  'amount',
  'remaining_cycles',
  'next_send_date',
  'frequency',
  'due_date_days',
  'auto_bill',
];

export function useAllRecurringInvoiceColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const recurringInvoiceColumns = [
    'status',
    'number',
    'client',
    'amount',
    'remaining_cycles',
    'next_send_date',
    'frequency',
    'due_date_days',
    'auto_bill',
    'archived_at',
    // 'assigned_to', @Todo: Need to fetch the relationship.
    'created_at',
    // 'created_by', @Todo: Need to fetch the relationship.
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'discount',
    'documents',
    'entity_state',
    'exchange_rate',
    'is_deleted',
    'po_number',
    'private_notes',
    'public_notes',
    'updated_at',
  ] as const;

  return recurringInvoiceColumns;
}

export function useRecurringInvoiceColumns() {
  const { t } = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const dateTime = useDateTime();
  const disableNavigation = useDisableNavigation();

  const recurringInvoiceColumns = useAllRecurringInvoiceColumns();
  type RecurringInvoiceColumns = (typeof recurringInvoiceColumns)[number];

  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const formatCustomFieldValue = useFormatCustomFieldValue();

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'invoice',
    });

  const columns: DataTableColumnsExtended<
    RecurringInvoice,
    RecurringInvoiceColumns
  > = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, recurringInvoice) => (
        <RecurringInvoiceStatusBadge entity={recurringInvoice} />
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, recurringInvoice) => (
        <DynamicLink
          to={route('/recurring_invoices/:id/edit', {
            id: recurringInvoice.id,
          })}
          renderSpan={disableNavigation('recurring_invoice', recurringInvoice)}
        >
          {value}
        </DynamicLink>
      ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, recurringInvoice) => (
        <DynamicLink
          to={route('/clients/:id', { id: recurringInvoice.client_id })}
          renderSpan={disableNavigation('client', recurringInvoice.client)}
        >
          {recurringInvoice.client?.display_name}
        </DynamicLink>
      ),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (value, recurringInvoice) =>
        formatMoney(
          value,
          recurringInvoice.client?.country_id,
          recurringInvoice.client?.settings.currency_id
        ),
    },
    {
      column: 'remaining_cycles',
      id: 'remaining_cycles',
      label: t('remaining_cycles'),
      format: (value) => (Number(value) < 0 ? t('endless') : value),
    },
    {
      column: 'next_send_date',
      id: 'next_send_datetime',
      label: t('next_send_date'),
      format: (value) => dateTime(value),
    },
    {
      column: 'frequency',
      id: 'frequency_id',
      label: t('frequency'),
      format: (value) => (
        <StatusBadge for={recurringInvoicesFrequency} code={value} headless />
      ),
    },
    {
      column: 'due_date_days',
      id: 'due_date_days',
      label: t('due_date'),
      format: (value) => {
        if (value === 'terms') return t('use_payment_terms');
        else if (Number(value) === 1) return t('first_day_of_the_month');
        else return value;
      },
    },
    {
      column: 'auto_bill',
      id: 'auto_bill',
      label: t('auto_bill'),
      format: (value) => t(String(value)),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: firstCustom,
      id: 'custom_value1',
      label: firstCustom,
      format: (value) => formatCustomFieldValue('invoice1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('invoice2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('invoice3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('invoice4', value?.toString()),
    },
    {
      column: 'discount',
      id: 'discount',
      label: t('discount'),
      format: (value, recurringInvoice) =>
        recurringInvoice.is_amount_discount
          ? formatMoney(
              value,
              recurringInvoice.client?.country_id,
              recurringInvoice.client?.settings.currency_id
            )
          : `${recurringInvoice.discount}%`,
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, recurringInvoice) => recurringInvoice.documents.length,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, recurringInvoice) => (
        <EntityStatus entity={recurringInvoice} />
      ),
    },
    {
      column: 'exchange_rate',
      id: 'exchange_rate',
      label: t('exchange_rate'),
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'po_number',
      id: 'po_number',
      label: t('po_number'),
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span dangerouslySetInnerHTML={{ __html: value as string }} />
        </Tooltip>
      ),
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span dangerouslySetInnerHTML={{ __html: value as string }} />
        </Tooltip>
      ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.recurringInvoice || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useRecurringInvoiceFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('active'),
      value: 'active',
      color: 'white',
      backgroundColor: '#22C55E',
    },
    {
      label: t('paused'),
      value: 'paused',
      color: 'white',
      backgroundColor: '#F97316',
    },
    {
      label: t('completed'),
      value: 'completed',
      color: 'white',
      backgroundColor: '#93C5FD',
    },
  ];

  return filters;
}
