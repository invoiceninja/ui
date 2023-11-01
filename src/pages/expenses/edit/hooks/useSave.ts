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
import { Dispatch, SetStateAction } from 'react';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  setErrors?: (errors: ValidationBag | undefined) => unknown;
  isFormBusy?: boolean;
  setIsFormBusy?: Dispatch<SetStateAction<boolean>>;
}

export function useSave(params: Props) {
  const { setErrors, isFormBusy, setIsFormBusy } = params;

  return (expense: Expense) => {
    if (!isFormBusy) {
      toast.processing();

      setErrors?.(undefined);

      setIsFormBusy?.(true);

      request(
        'PUT',
        endpoint('/api/v1/expenses/:id', { id: expense.id }),
        expense
      )
        .then(() => {
          toast.success('updated_expense');

          $refetch(['expenses']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors?.(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy?.(false));
    }
  };
}
