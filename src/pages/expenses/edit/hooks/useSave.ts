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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Expense } from '$app/common/interfaces/expense';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { useNavigate } from 'react-router-dom';

interface Props {
  setErrors: (errors: ValidationBag | undefined) => unknown;
}

export function useSave(params: Props) {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { setErrors } = params;

  return (expense: Expense) => {
    toast.processing();

    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/expenses/:id', { id: expense.id }),
      expense
    )
      .then(() => {
        toast.success('updated_expense');

        queryClient.invalidateQueries(
          route('/api/v1/expenses/:id', { id: expense.id })
        );

        navigate('/expenses');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          console.error(error);
          toast.error();
        }
      });
  };
}
