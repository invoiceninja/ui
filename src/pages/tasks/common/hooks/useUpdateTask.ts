/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Task } from '$app/common/interfaces/task';
import { AxiosError } from 'axios';
import { isOverlapping } from '../helpers/is-overlapping';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Params {
  isFormBusy: boolean;
  setErrors?: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
}
export function useUpdateTask(params: Params) {
  const { isFormBusy, setErrors, setIsFormBusy } = params;

  return (task: Task) => {
    if (!isFormBusy) {
      setIsFormBusy(true);

      toast.processing();

      if (isOverlapping(task)) {
        setIsFormBusy(false);
        return toast.error('task_errors');
      }

      request('PUT', endpoint('/api/v1/tasks/:id', { id: task.id }), task)
        .then(() => {
          
          toast.success('updated_task');
          $refetch(['tasks']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors?.(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };
}
