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
import { Schedule } from 'common/interfaces/schedule';
import { cloneDeep, set } from 'lodash';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setSchedule: Dispatch<SetStateAction<Schedule | undefined>>;
  schedule: Schedule | undefined;
}

export function useHandleChange(params: Params) {
  return (property: keyof Schedule, value: Schedule[keyof Schedule]) => {
    const { setErrors, setSchedule } = params;

    setErrors(undefined);

    const schedule = cloneDeep(params.schedule);

    setSchedule(set(schedule as Schedule, property, value));
  };
}
