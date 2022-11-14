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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';
import { RecurringExpense } from 'common/interfaces/recurring-expenses';

interface Props {
  setErrors: (errors: ValidationBag | undefined) => unknown;
}

export function useSave(props: Props) {
  const queryClient = useQueryClient();
  const { setErrors } = props;

  return (expense: RecurringExpense) => {
    toast.processing();
    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/recurring_expenses/:id', { id: expense.id }),
      expense
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
          route('/api/v1/recurring_expenses/:id', { id: expense.id })
        )
      );
  };
}
