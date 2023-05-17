/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { Schedule } from '$app/common/interfaces/schedule';
import { cloneDeep, set } from 'lodash';
import { useBlankScheduleQuery } from '$app/common/queries/schedules';
import { Frequency } from '$app/common/enums/frequency';
import { blankScheduleParameters } from '../../create/Create';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setSchedule: Dispatch<SetStateAction<Schedule | undefined>>;
  schedule: Schedule | undefined;
}

export function useHandleChange(params: Params) {
  const { data: blankSchedule } = useBlankScheduleQuery();

  return (property: keyof Schedule, value: Schedule[keyof Schedule]) => {
    const { setErrors, setSchedule } = params;

    setErrors(undefined);

    const schedule = cloneDeep(params.schedule);

    if (property === 'template' && blankSchedule) {
      setSchedule(() => ({
        ...blankSchedule,
        template: value as string,
        frequency_id: Frequency.Monthly,
        remaining_cycles: -1,
        parameters: blankScheduleParameters,
      }));
    } else {
      if (property === ('parameters.entity' as keyof Schedule)) {
        setSchedule(set(schedule as Schedule, 'parameters.entity_id', ''));
      }

      setSchedule(set(schedule as Schedule, property, value));
    }
  };
}
