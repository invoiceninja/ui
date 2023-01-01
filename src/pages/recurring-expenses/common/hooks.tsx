/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Expense } from 'common/interfaces/expense';
import { StatusBadge } from 'components/StatusBadge';
import recurringExpenseStatus from 'common/constants/recurring-expense';
import recurringExpensesFrequency from 'common/constants/recurring-expense-frequency';
import { useTranslation } from 'react-i18next';
import { date, endpoint } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { EntityStatus } from 'components/EntityStatus';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { Link } from '@invoiceninja/forms';
import { route } from 'common/helpers/route';
import { Divider } from 'components/cards/Divider';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Action } from 'components/ResourceActions';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { recurringExpenseAtom } from './atoms';
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { RecurringExpenseStatus } from 'common/enums/recurring-expense-status';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { expenseAtom } from 'pages/expenses/common/atoms';
import paymentType from 'common/constants/payment-type';
import { customField } from 'components/CustomField';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { DataTableColumnsExtended } from 'pages/invoices/common/hooks/useInvoiceColumns';
import { Dispatch, SetStateAction } from 'react';
import { ValidationBag } from 'common/interfaces/validation-bag';

export const recurringExpenseColumns = [
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
  'frequency',
  'remaining_cycles',
  'next_send_date',
] as const;

type RecurringExpenseColumns = typeof recurringExpenseColumns[number];

export const defaultColumns: RecurringExpenseColumns[] = [
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

export function useRecurringExpenseColumns() {
  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const currentUser = useCurrentUser();

  const columns: DataTableColumnsExtended<
    RecurringExpense,
    RecurringExpenseColumns
  > = [
    {
      column: 'status',
      id: 'status_id',
      label: t('status'),
      format: (value, recurringExpense) => (
        <Link
          to={route('/recurring_expenses/:id/edit', {
            id: recurringExpense.id,
          })}
        >
          <StatusBadge for={recurringExpenseStatus} code={value} />
        </Link>
      ),
    },
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (field, recurringExpense) => (
        <Link
          to={route('/recurring_expenses/:id/edit', {
            id: recurringExpense.id,
          })}
        >
          {field}
        </Link>
      ),
    },
    {
      column: 'vendor',
      id: 'vendor_id',
      label: t('vendor'),
      format: (value, recurringExpense) =>
        recurringExpense.vendor && (
          <Link to={route('/vendors/:id', { id: value.toString() })}>
            {recurringExpense.vendor.name}
          </Link>
        ),
    },
    {
      column: 'client',
      id: 'client_id',
      label: t('client'),
      format: (value, recurringExpense) =>
        recurringExpense.client && (
          <Link to={route('/clients/:id', { id: value.toString() })}>
            {recurringExpense.client.display_name}
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
    currentUser?.company_user?.settings?.react_table_columns
      ?.recurringExpense || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

export function useToggleStartStop() {
  const queryClient = useQueryClient();

  return (recurringExpense: RecurringExpense, action: 'start' | 'stop') => {
    toast.processing();

    const url =
      action === 'start'
        ? '/api/v1/recurring_expenses/:id?start=true'
        : '/api/v1/recurring_expenses/:id?stop=true';

    request('PUT', endpoint(url, { id: recurringExpense.id }), recurringExpense)
      .then(() => {
        queryClient.invalidateQueries('/api/v1/recurring_expenses');

        queryClient.invalidateQueries(
          route('/api/v1/recurring_expenses/:id', {
            id: recurringExpense.id,
          })
        );

        toast.success(action === 'start' ? 'start' : 'stop');
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      });
  };
}

export function useActions() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const [, setExpense] = useAtom(expenseAtom);

  const [, setRecurringExpense] = useAtom(recurringExpenseAtom);

  const toggleStartStop = useToggleStartStop();

  const cloneToRecurringExpense = (recurringExpense: RecurringExpense) => {
    setRecurringExpense({ ...recurringExpense, documents: [], number: '' });

    navigate('/recurring_expenses/create');
  };

  const cloneToExpense = (recurringExpense: RecurringExpense) => {
    setExpense({
      ...(recurringExpense as Expense),
      documents: [],
      number: '',
    });

    navigate('/expenses/create');
  };

  const actions: Action<RecurringExpense>[] = [
    (recurringExpense) =>
      (recurringExpense.status_id === RecurringExpenseStatus.DRAFT ||
        recurringExpense.status_id === RecurringExpenseStatus.PAUSED) && (
        <DropdownElement
          onClick={() => toggleStartStop(recurringExpense, 'start')}
        >
          {t('start')}
        </DropdownElement>
      ),
    (recurringExpense) =>
      recurringExpense.status_id === RecurringExpenseStatus.ACTIVE && (
        <DropdownElement
          onClick={() => toggleStartStop(recurringExpense, 'stop')}
        >
          {t('stop')}
        </DropdownElement>
      ),
    () => <Divider withoutPadding />,
    (recurringExpense) => (
      <DropdownElement
        onClick={() => cloneToRecurringExpense(recurringExpense)}
      >
        {t('clone')}
      </DropdownElement>
    ),
    (recurringExpense) => (
      <DropdownElement onClick={() => cloneToExpense(recurringExpense)}>
        {t('clone_to_expense')}
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
