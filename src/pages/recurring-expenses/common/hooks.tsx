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
import { DataTableColumns } from 'components/DataTable';
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

export function useRecurringExpenseColumns() {
  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const columns: DataTableColumns<Expense> = [
    {
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
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'frequency_id',
      label: t('frequency'),
      format: (value) => (
        <StatusBadge for={recurringExpensesFrequency} code={value} headless />
      ),
    },
    {
      id: 'next_send_date',
      label: t('next_send_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'remaining_cycles',
      label: t('remaining_cycles'),
    },
    {
      id: 'amount',
      label: t('amount'),
      format: (value, recurringExpense) => {
        return formatMoney(
          recurringExpense.amount,
          company?.settings.country_id,
          recurringExpense.currency_id
        );
      },
    },
    {
      id: 'public_notes',
      label: t('public_notes'),
    },
    {
      id: 'entity_status',
      label: t('entity_status'),
      format: (value, resource) => <EntityStatus entity={resource} />,
    },
  ];

  return columns;
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

        toast.success(
          action === 'start'
            ? 'started_recurring_expense'
            : 'stopped_recurring_expense'
        );
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
        {t('clone_to_recurring')}
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
