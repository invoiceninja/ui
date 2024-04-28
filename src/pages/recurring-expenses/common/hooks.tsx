/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Expense } from '$app/common/interfaces/expense';
import { StatusBadge } from '$app/components/StatusBadge';
import recurringExpensesFrequency from '$app/common/constants/recurring-expense-frequency';
import { useTranslation } from 'react-i18next';
import { date, endpoint, getEntityState } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { EntityStatus } from '$app/components/EntityStatus';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { route } from '$app/common/helpers/route';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Action } from '$app/components/ResourceActions';
import { useNavigate } from 'react-router-dom';
import { recurringExpenseAtom } from './atoms';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { RecurringExpenseStatus } from '$app/common/enums/recurring-expense-status';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { expenseAtom } from '$app/pages/expenses/common/atoms';
import paymentType from '$app/common/constants/payment-type';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { Dispatch, SetStateAction } from 'react';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Icon } from '$app/components/icons/Icon';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdNotStarted,
  MdRestore,
  MdStopCircle,
} from 'react-icons/md';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { RecurringExpenseStatus as RecurringExpenseStatusBadge } from './components/RecurringExpenseStatus';
import { Tooltip } from '$app/components/Tooltip';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useAtomValue, useSetAtom } from 'jotai';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { EntityState } from '$app/common/enums/entity-state';
import { useBulk } from '$app/common/queries/recurring-expense';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useCalculateExpenseAmount } from '$app/pages/expenses/common/hooks/useCalculateExpenseAmount';

export const defaultColumns: string[] = [
  'status',
  'number',
  'vendor',
  'client',
  'date',
  'frequency',
  'next_send_date',
  'remaining_cycles',
  'amount',
  'public_notes',
  'entity_state',
];

export function useAllRecurringExpenseColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'expense',
    });

  const recurringExpenseColumns = [
    'status',
    'number',
    'vendor',
    'client',
    'date',
    'amount',
    'public_notes',
    'entity_state',
    'archived_at',
    //   'assigned_to', @Todo: Need to resolve relationship
    //   'category', @Todo: Need to resolve relationship
    'created_at',
    'created_by',
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'documents',
    'exchange_rate',
    'is_deleted',
    'net_amount', // @Todo: `net_amount` vs `amount`?
    'payment_date',
    'payment_type',
    'private_notes',
    //   'project', @Todo: Need to resolve relationship
    //   'recurring_expense', @Todo: Need to resolve relationship
    'should_be_invoiced',
    //   'tax_amount', @Todo: Need to calc
    'tax_name1',
    'tax_name2',
    'tax_name3',
    'tax_rate1',
    'tax_rate2',
    'tax_rate3',
    'transaction_reference',
    'updated_at',
    'frequency',
    'remaining_cycles',
    'next_send_date',
  ] as const;

  return recurringExpenseColumns;
}

export function useRecurringExpenseColumns() {
  const [t] = useTranslation();

  const disableNavigation = useDisableNavigation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const formatCustomFieldValue = useFormatCustomFieldValue();
  const calculateExpenseAmount = useCalculateExpenseAmount();

  const recurringExpenseColumns = useAllRecurringExpenseColumns();
  type RecurringExpenseColumns = (typeof recurringExpenseColumns)[number];

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'expense',
    });

  const columns: DataTableColumnsExtended<
    RecurringExpense,
    RecurringExpenseColumns
  > = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, recurringExpense) => (
        <DynamicLink
          to={route('/recurring_expenses/:id/edit', {
            id: recurringExpense.id,
          })}
          renderSpan={disableNavigation('recurring_expense', recurringExpense)}
        >
          <RecurringExpenseStatusBadge recurringExpense={recurringExpense} />
        </DynamicLink>
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (field, recurringExpense) => (
        <DynamicLink
          to={route('/recurring_expenses/:id/edit', {
            id: recurringExpense.id,
          })}
          renderSpan={disableNavigation('recurring_expense', recurringExpense)}
        >
          {field}
        </DynamicLink>
      ),
    },
    {
      column: 'vendor',
      id: 'vendor_id',
      label: t('vendor'),
      format: (value, recurringExpense) =>
        recurringExpense.vendor && (
          <DynamicLink
            to={route('/vendors/:id', { id: value.toString() })}
            renderSpan={disableNavigation('vendor', recurringExpense.vendor)}
          >
            {recurringExpense.vendor.name}
          </DynamicLink>
        ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, recurringExpense) =>
        recurringExpense.client && (
          <DynamicLink
            to={route('/clients/:id', { id: value.toString() })}
            renderSpan={disableNavigation('client', recurringExpense.client)}
          >
            {recurringExpense.client.display_name}
          </DynamicLink>
        ),
    },
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (_, recurringExpense) =>
        formatMoney(
          calculateExpenseAmount(recurringExpense),
          recurringExpense.client?.country_id,
          recurringExpense.currency_id ||
            recurringExpense.client?.settings.currency_id
        ),
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
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, resource) => <EntityStatus entity={resource} />,
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
      format: (value) => formatCustomFieldValue('expense1', value?.toString()),
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
      format: (value) => formatCustomFieldValue('expense2', value?.toString()),
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
      format: (value) => formatCustomFieldValue('expense3', value?.toString()),
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
      format: (value) => formatCustomFieldValue('expense4', value?.toString()),
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, recurringExpense) => recurringExpense.documents.length,
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
      format: (value, recurringExpense) =>
        recurringExpense.is_deleted ? t('yes') : t('no'),
    },
    {
      column: 'net_amount',
      id: 'amount',
      label: t('net_amount'),
      format: (value, recurringExpense) =>
        formatMoney(
          value,
          recurringExpense.client?.country_id,
          recurringExpense.currency_id ||
            recurringExpense.client?.settings.currency_id
        ),
    },
    {
      column: 'payment_date',
      id: 'payment_date',
      label: t('payment_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'payment_type',
      id: 'payment_type_id',
      label: t('payment_type'),
      format: (value) => (
        <StatusBadge for={paymentType} code={value} headless />
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
      column: 'should_be_invoiced',
      id: 'should_be_invoiced',
      label: t('should_be_invoiced'),
      format: (value) => (value ? t('yes') : t('no')),
    },
    {
      column: 'tax_name1',
      id: 'tax_name1',
      label: t('tax_name1'),
    },
    {
      column: 'tax_name2',
      id: 'tax_name2',
      label: t('tax_name2'),
    },
    {
      column: 'tax_name3',
      id: 'tax_name3',
      label: t('tax_name3'),
    },
    {
      column: 'tax_rate1',
      id: 'tax_rate1',
      label: t('tax_rate1'),
    },
    {
      column: 'tax_rate2',
      id: 'tax_rate2',
      label: t('tax_rate2'),
    },
    {
      column: 'tax_rate3',
      id: 'tax_rate3',
      label: t('tax_rate3'),
    },
    {
      column: 'transaction_reference',
      id: 'transaction_reference',
      label: t('transaction_reference'),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'frequency',
      id: 'frequency_id',
      label: t('frequency'),
      format: (value) => (
        <StatusBadge for={recurringExpensesFrequency} code={value} headless />
      ),
    },
    {
      column: 'next_send_date',
      id: 'next_send_date',
      label: t('next_send_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'remaining_cycles',
      id: 'remaining_cycles',
      label: t('remaining_cycles'),
      format: (value) => {
        if (value.toString() === '-1') {
          return <span>{t('endless')}</span>;
        }
        return <span>{value}</span>;
      },
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.recurringExpense || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useToggleStartStop() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (recurringExpense: RecurringExpense, action: 'start' | 'stop') => {
    toast.processing();

    const url =
      action === 'start'
        ? '/api/v1/recurring_expenses/:id?start=true'
        : '/api/v1/recurring_expenses/:id?stop=true';

    request(
      'PUT',
      endpoint(url, { id: recurringExpense.id }),
      recurringExpense
    ).then(() => {
      $refetch(['recurring_expenses']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);

      toast.success(action === 'start' ? 'start' : 'stop');
    });
  };
}

export function useActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const hasPermission = useHasPermission();

  const setExpense = useSetAtom(expenseAtom);

  const setRecurringExpense = useSetAtom(recurringExpenseAtom);

  const toggleStartStop = useToggleStartStop();

  const bulk = useBulk();

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'recurring_expense',
    editPageTabs: ['documents'],
  });

  const cloneToRecurringExpense = (recurringExpense: RecurringExpense) => {
    setRecurringExpense({
      ...recurringExpense,
      id: '',
      documents: [],
      number: '',
    });

    navigate('/recurring_expenses/create?action=clone');
  };

  const cloneToExpense = (recurringExpense: RecurringExpense) => {
    setExpense({
      ...(recurringExpense as Expense),
      id: '',
      documents: [],
      number: '',
    });

    navigate('/expenses/create?action=clone');
  };

  const actions: Action<RecurringExpense>[] = [
    (recurringExpense) =>
      (recurringExpense.status_id === RecurringExpenseStatus.Draft ||
        recurringExpense.status_id === RecurringExpenseStatus.Paused) && (
        <DropdownElement
          onClick={() => toggleStartStop(recurringExpense, 'start')}
          icon={<Icon element={MdNotStarted} />}
        >
          {t('start')}
        </DropdownElement>
      ),
    (recurringExpense) =>
      recurringExpense.status_id === RecurringExpenseStatus.Active && (
        <DropdownElement
          onClick={() => toggleStartStop(recurringExpense, 'stop')}
          icon={<Icon element={MdStopCircle} />}
        >
          {t('stop')}
        </DropdownElement>
      ),
    () => <Divider withoutPadding />,
    (recurringExpense) =>
      hasPermission('create_recurring_expense') && (
        <DropdownElement
          onClick={() => cloneToRecurringExpense(recurringExpense)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>
      ),
    (recurringExpense) =>
      hasPermission('create_expense') && (
        <DropdownElement
          onClick={() => cloneToExpense(recurringExpense)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone_to_expense')}
        </DropdownElement>
      ),
    () => isEditPage && <Divider withoutPadding />,
    (recurringExpense) =>
      isEditPage &&
      getEntityState(recurringExpense) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([recurringExpense.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (recurringExpense) =>
      isEditPage &&
      (getEntityState(recurringExpense) === EntityState.Archived ||
        getEntityState(recurringExpense) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([recurringExpense.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (recurringExpense) =>
      isEditPage &&
      (getEntityState(recurringExpense) === EntityState.Active ||
        getEntityState(recurringExpense) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([recurringExpense.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

interface HandleChangeRecurringExpenseParams {
  setRecurringExpense: Dispatch<SetStateAction<RecurringExpense | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function useHandleChange(params: HandleChangeRecurringExpenseParams) {
  const { setRecurringExpense, setErrors } = params;

  return <T extends keyof RecurringExpense>(
    property: T,
    value: RecurringExpense[typeof property]
  ) => {
    setErrors(undefined);

    setRecurringExpense(
      (recurringExpense) =>
        recurringExpense && { ...recurringExpense, [property]: value }
    );
  };
}
