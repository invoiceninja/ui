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
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { useNavigate } from 'react-router-dom';

interface Props {
  setErrors: (errors: ValidationBag | undefined) => unknown;
}

export function useSave(props: Props) {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { setErrors } = props;

  return (recurringExpense: RecurringExpense) => {
    toast.processing();

    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/recurring_expenses/:id', { id: recurringExpense.id }),
      recurringExpense
    )
      .then(() => {
        toast.success('updated_recurring_expense');

        queryClient.invalidateQueries(
          route('/api/v1/recurring_expenses/:id', { id: recurringExpense.id })
        );

        navigate('/recurring_expenses');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          toast.error();
          console.error(error);
        }
      });
  };
}
