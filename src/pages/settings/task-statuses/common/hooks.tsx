/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from 'common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { TaskStatus } from 'common/interfaces/task-status';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setTaskStatus: Dispatch<SetStateAction<TaskStatus | undefined>>;
}

export function useHandleChange(params: Params) {
  return (property: keyof TaskStatus, value: TaskStatus[keyof TaskStatus]) => {
    params.setErrors(undefined);

    params.setTaskStatus(
      (taskStatus) => taskStatus && { ...taskStatus, [property]: value }
    );
  };
}
