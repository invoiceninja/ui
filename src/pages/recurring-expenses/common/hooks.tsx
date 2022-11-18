import { AxiosError } from 'axios';
import { RecurringExpenseStatus } from 'common/enums/recurring-expense-status';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Divider } from 'components/cards/Divider';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Action } from 'components/ResourceActions';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { recurringExpenseAtom } from './atoms';

export type ChangeHandler = <T extends keyof RecurringExpense>(
  property: T,
  value: RecurringExpense[typeof property]
) => void;

interface RecurringExpenseSaveProps {
  setErrors: (errors: ValidationBag | undefined) => unknown;
}

export function useRecurringExpenseUtilities() {
  const [, setRecurringExpense] = useAtom(recurringExpenseAtom);

  const handleChange: ChangeHandler = (property, value) => {
    setRecurringExpense(
      (recurringExpense) =>
        recurringExpense && { ...recurringExpense, [property]: value }
    );
  };

  return {
    handleChange,
  };
}

export function useCreate({ setErrors }: RecurringExpenseSaveProps) {
  const navigate = useNavigate();

  return (recurringExpense: RecurringExpense) => {
    toast.processing();
    setErrors(undefined);

    request('POST', endpoint('/api/v1/recurring_expenses'), recurringExpense)
      .then((response: GenericSingleResourceResponse<RecurringExpense>) => {
        toast.success('created_recurring_expense');

        navigate(
          route('/recurring_expenses/:id/edit', { id: response.data.data.id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);

        error.response?.status === 422
          ? toast.dismiss() && setErrors(error.response.data)
          : toast.error();
      });
  };
}

export function useSave(props: RecurringExpenseSaveProps) {
  const queryClient = useQueryClient();
  const { setErrors } = props;

  return (recurringExpense: RecurringExpense) => {
    toast.processing();
    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/recurring_expenses/:id', { id: recurringExpense.id }),
      recurringExpense
    )
      .then(() => toast.success('updated_recurring_expense'))
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();

        if (error.response?.status === 422) {
          setErrors(error.response.data);
        }
      })
      .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/recurring_expenses/:id', { id: recurringExpense.id })
        )
      );
  };
}

export function useToggleStartStop() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  return (expense: RecurringExpense, action: 'start' | 'stop') => {
    toast.processing();

    const url =
      action === 'start'
        ? `/api/v1/recurring_expenses/:id?start=true`
        : '/api/v1/recurring_expenses/:id?stop=true';

    request('PUT', endpoint(url, { id: expense.id }), expense)
      .then(() => {
        toast.success(
          action === 'start'
            ? t('started_recurring_expense')
            : t('stopped_recurring_expense')
        );
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      })
      .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/recurring_expenses/:id', { id: expense.id })
        )
      );
  };
}

export type BulkAction = 'archive' | 'restore' | 'delete';

export function useBulk() {
  const queryClient = useQueryClient();

  const invalidateCache = (id: string) =>
    queryClient.invalidateQueries(
      route('/api/v1/recurring_expenses/:id', { id })
    );

  return (ids: string[], action: BulkAction) => {
    toast.processing();

    request('POST', endpoint('/api/v1/recurring_expenses/bulk'), {
      ids,
      action,
    })
      .then(() => toast.success(`${action}d_recurring_expense`))
      .catch((error) => {
        console.error(error);
        toast.error();
      })
      .finally(() => ids.forEach((id) => invalidateCache(id)));
  };
}

export function useActions() {
  const [, setRecurringExpense] = useAtom(recurringExpenseAtom);

  const { t } = useTranslation();
  const bulk = useBulk();

  const navigate = useNavigate();
  const toggleStartStop = useToggleStartStop();

  const cloneToRecurringExpense = (recurringExpense: RecurringExpense) => {
    setRecurringExpense({ ...recurringExpense, documents: [], number: '' });

    navigate('/recurring_expenses/create');
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
    () => <Divider withoutPadding />,
    (recurringExpense) =>
      recurringExpense.archived_at === 0 && (
        <DropdownElement onClick={() => bulk([recurringExpense.id], 'archive')}>
          {t('archive')}
        </DropdownElement>
      ),
    (recurringExpense) =>
      recurringExpense.archived_at > 0 && (
        <DropdownElement onClick={() => bulk([recurringExpense.id], 'restore')}>
          {t('restore')}
        </DropdownElement>
      ),
    (recurringExpense) =>
      !recurringExpense.is_deleted && (
        <DropdownElement onClick={() => bulk([recurringExpense.id], 'delete')}>
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
