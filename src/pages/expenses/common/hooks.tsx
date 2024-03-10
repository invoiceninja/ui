/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import paymentType from '$app/common/constants/payment-type';
import { date, getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Expense } from '$app/common/interfaces/expense';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { SelectOption } from '$app/components/datatables/Actions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { EntityStatus } from '$app/components/EntityStatus';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { StatusBadge } from '$app/components/StatusBadge';
import { Tooltip } from '$app/components/Tooltip';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { recurringExpenseAtom } from '$app/pages/recurring-expenses/common/atoms';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdRestore,
  MdTextSnippet,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { expenseAtom } from './atoms';
import { ExpenseStatus } from './components/ExpenseStatus';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useSetAtom } from 'jotai';
import { useBulk } from '$app/common/queries/expenses';
import { Divider } from '$app/components/cards/Divider';
import { EntityState } from '$app/common/enums/entity-state';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useInvoiceExpense } from './useInvoiceExpense';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { AddToInvoiceAction } from './components/AddToInvoiceAction';
import { ExpenseCategory } from './components/ExpenseCategory';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Assigned } from '$app/components/Assigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { useFormatCustomFieldValue } from '$app/common/hooks/useFormatCustomFieldValue';
import { useCalculateExpenseAmount } from './hooks/useCalculateExpenseAmount';

export function useActions() {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const navigate = useNavigate();
  const bulk = useBulk();

  const setExpense = useSetAtom(expenseAtom);
  const setRecurringExpense = useSetAtom(recurringExpenseAtom);

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'expense',
    editPageTabs: ['documents'],
  });

  const { create } = useInvoiceExpense();

  const cloneToExpense = (expense: Expense) => {
    setExpense({ ...expense, id: '', documents: [], number: '' });

    navigate('/expenses/create?action=clone');
  };

  const cloneToRecurringExpense = (expense: Expense) => {
    setRecurringExpense({
      ...(expense as RecurringExpense),
      id: '',
      documents: [],
      number: '',
    });

    navigate('/recurring_expenses/create?action=clone');
  };

  const actions: Action<Expense>[] = [
    (expense) =>
      expense.should_be_invoiced === true &&
      expense.invoice_id.length === 0 &&
      hasPermission('create_invoice') && (
        <DropdownElement
          onClick={() => create(expense)}
          icon={<Icon element={MdTextSnippet} />}
        >
          {t('invoice_expense')}
        </DropdownElement>
      ),
    (expense) =>
      expense.should_be_invoiced === true &&
      expense.invoice_id.length === 0 && (
        <AddToInvoiceAction expense={expense} />
      ),
    (expense) =>
      hasPermission('create_expense') && (
        <DropdownElement
          onClick={() => cloneToExpense(expense)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>
      ),
    (expense) =>
      hasPermission('create_recurring_expense') && (
        <DropdownElement
          onClick={() => cloneToRecurringExpense(expense)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone_to_recurring')}
        </DropdownElement>
      ),
    () => isEditPage && <Divider withoutPadding />,
    (expense) =>
      getEntityState(expense) === EntityState.Active &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([expense.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (expense) =>
      (getEntityState(expense) === EntityState.Archived ||
        getEntityState(expense) === EntityState.Deleted) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([expense.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (expense) =>
      (getEntityState(expense) === EntityState.Active ||
        getEntityState(expense) === EntityState.Archived) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([expense.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

export const defaultColumns: string[] = [
  'status',
  'number',
  'client',
  'vendor',
  'date',
  'amount',
  'public_notes',
];

export function useAllExpenseColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'expense',
    });

  const expenseColumns = [
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
    'category',
    'created_at',
    //'created_by', @Todo: Need to resolve relationship
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
  ] as const;

  return expenseColumns;
}

export function useExpenseColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const navigate = useNavigate();
  const formatMoney = useFormatMoney();
  const reactSettings = useReactSettings();
  const formatCustomFieldValue = useFormatCustomFieldValue();
  const calculateExpenseAmount = useCalculateExpenseAmount();

  const expenseColumns = useAllExpenseColumns();
  type ExpenseColumns = (typeof expenseColumns)[number];

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'expense',
    });

  const columns: DataTableColumnsExtended<Expense, ExpenseColumns> = [
    {
      column: 'category',
      id: 'category_id',
      label: t('category'),
      format: (_, expense) => expense && <ExpenseCategory expense={expense} />,
    },
    {
      column: 'status',
      id: 'id',
      label: t('status'),
      format: (value, expense) => (
        <div className="flex items-center space-x-2">
          <DynamicLink
            to={route('/expenses/:id/edit', { id: expense.id })}
            renderSpan={disableNavigation('expense', expense)}
          >
            <span className="inline-flex items-center space-x-4">
              <ExpenseStatus entity={expense} />
            </span>
          </DynamicLink>

          {expense.invoice_id && (
            <Assigned
              entityId={expense.invoice_id}
              cacheEndpoint="/api/v1/invoices"
              apiEndpoint="/api/v1/invoices/:id?include=client.group_settings"
              preCheck={
                hasPermission('view_invoice') || hasPermission('edit_invoice')
              }
              component={
                <Icon
                  element={MdTextSnippet}
                  size={19}
                  onClick={() =>
                    navigate(
                      route('/invoices/:id/edit', { id: expense.invoice_id })
                    )
                  }
                />
              }
            />
          )}
        </div>
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (field, expense) => (
        <DynamicLink
          to={route('/expenses/:id/edit', { id: expense.id })}
          renderSpan={disableNavigation('expense', expense)}
        >
          {field}
        </DynamicLink>
      ),
    },
    {
      column: 'vendor',
      id: 'vendor_id',
      label: t('vendor'),
      format: (value, expense) =>
        expense.vendor && (
          <DynamicLink
            to={route('/vendors/:id', { id: value.toString() })}
            renderSpan={disableNavigation('vendor', expense.vendor)}
          >
            {expense.vendor.name}
          </DynamicLink>
        ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, expense) =>
        expense.client && (
          <DynamicLink
            to={route('/clients/:id', { id: value.toString() })}
            renderSpan={disableNavigation('client', expense.client)}
          >
            {expense.client.display_name}
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
      format: (_, expense) =>
        formatMoney(
          calculateExpenseAmount(expense),
          expense.client?.country_id,
          expense.currency_id || expense.client?.settings.currency_id
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
      format: (value, expense) => expense.documents.length,
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
      format: (value, expense) => (expense.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'net_amount',
      id: 'amount',
      label: t('net_amount'),
      format: (value, expense) =>
        formatMoney(
          value,
          expense.client?.country_id,
          expense.currency_id || expense.client?.settings.currency_id
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
      format: (value, expense) =>
        expense.should_be_invoiced ? t('yes') : t('no'),
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
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.expense || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

interface HandleChangeExpenseParams {
  setExpense: Dispatch<SetStateAction<Expense | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function useHandleChange(params: HandleChangeExpenseParams) {
  const { setExpense, setErrors } = params;

  return <T extends keyof Expense>(
    property: T,
    value: Expense[typeof property]
  ) => {
    setErrors(undefined);

    setExpense((expense) => expense && { ...expense, [property]: value });
  };
}

export function useExpenseFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('logged'),
      value: 'logged',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('pending'),
      value: 'pending',
      color: 'white',
      backgroundColor: '#93C5FD',
    },
    {
      label: t('invoiced'),
      value: 'invoiced',
      color: 'white',
      backgroundColor: '#1D4ED8',
    },
    {
      label: t('paid'),
      value: 'paid',
      color: 'white',
      backgroundColor: '#22C55E',
    },
    {
      label: t('unpaid'),
      value: 'unpaid',
      color: 'white',
      backgroundColor: '#e6b05c',
    },
  ];

  return filters;
}
