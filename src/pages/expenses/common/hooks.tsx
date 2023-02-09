/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import paymentType from 'common/constants/payment-type';
import { date } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { Expense } from 'common/interfaces/expense';
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { customField } from 'components/CustomField';
import { SelectOption } from 'components/datatables/Actions';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { EntityStatus } from 'components/EntityStatus';
import { Icon } from 'components/icons/Icon';
import { Action } from 'components/ResourceActions';
import { StatusBadge } from 'components/StatusBadge';
import { useUpdateAtom } from 'jotai/utils';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { recurringExpenseAtom } from 'pages/recurring-expenses/common/atoms';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { expenseAtom } from './atoms';
import { ExpenseStatus } from './components/ExpenseStatus';

export const expenseColumns = [
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
  'custom1',
  'custom2',
  'custom3',
  'custom4',
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

type ExpenseColumns = typeof expenseColumns[number];

export function useActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const setExpense = useUpdateAtom(expenseAtom);

  const setRecurringExpense = useUpdateAtom(recurringExpenseAtom);

  const cloneToExpense = (expense: Expense) => {
    setExpense({ ...expense, documents: [], number: '' });

    navigate('/expenses/create?action=clone');
  };

  const cloneToRecurringExpense = (expense: Expense) => {
    setRecurringExpense({
      ...(expense as RecurringExpense),
      documents: [],
      number: '',
    });

    navigate('/recurring_expenses/create');
  };

  const actions: Action<Expense>[] = [
    (expense) => (
      <DropdownElement
        onClick={() => cloneToExpense(expense)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
    (expense) => (
      <DropdownElement
        onClick={() => cloneToRecurringExpense(expense)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone_to_recurring')}
      </DropdownElement>
    ),
  ];

  return actions;
}

export const defaultColumns: ExpenseColumns[] = [
  'status',
  'number',
  'client',
  'vendor',
  'date',
  'amount',
  'public_notes',
];

export function useExpenseColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const currentUser = useCurrentUser();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const columns: DataTableColumnsExtended<Expense, ExpenseColumns> = [
    {
      column: 'status',
      id: 'id',
      label: t('status'),
      format: (value, expense) => (
        <Link to={route('/expenses/:id/edit', { id: expense.id })}>
          <span className="inline-flex items-center space-x-4">
            <ExpenseStatus entity={expense} />
          </span>
        </Link>
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (field, expense) => (
        <Link to={route('/expenses/:id/edit', { id: expense.id })}>
          {field}
        </Link>
      ),
    },
    {
      column: 'vendor',
      id: 'vendor_id',
      label: t('vendor'),
      format: (value, expense) =>
        expense.vendor && (
          <Link to={route('/vendors/:id', { id: value.toString() })}>
            {expense.vendor.name}
          </Link>
        ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, expense) =>
        expense.client && (
          <Link to={route('/clients/:id', { id: value.toString() })}>
            {expense.client.display_name}
          </Link>
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
      format: (value) =>
        formatMoney(
          value,
          company?.settings.country_id,
          company?.settings.currency_id
        ),
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => <span className="truncate">{value}</span>,
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
      column: 'custom1',
      id: 'custom_value1',
      label:
        (company?.custom_fields.expense1 &&
          customField(company?.custom_fields.expense1).label()) ||
        t('first_custom'),
    },
    {
      column: 'custom2',
      id: 'custom_value2',
      label:
        (company?.custom_fields.expense2 &&
          customField(company?.custom_fields.expense2).label()) ||
        t('second_custom'),
    },
    {
      column: 'custom3',
      id: 'custom_value3',
      label:
        (company?.custom_fields.expense3 &&
          customField(company?.custom_fields.expense3).label()) ||
        t('third_custom'),
    },
    {
      column: 'custom4',
      id: 'custom_value4',
      label:
        (company?.custom_fields.expense4 &&
          customField(company?.custom_fields.expense4).label()) ||
        t('forth_custom'),
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
      format: (value) =>
        formatMoney(
          value,
          company?.settings.country_id,
          company?.settings.currency_id
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
      format: (value) => <span className="truncate">{value}</span>,
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
    currentUser?.company_user?.settings?.react_table_columns?.expense ||
    defaultColumns;

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
