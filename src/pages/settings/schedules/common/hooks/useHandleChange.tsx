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
import { Parameters, Schedule } from '$app/common/interfaces/schedule';
import { cloneDeep, set } from 'lodash';
import { useBlankScheduleQuery } from '$app/common/queries/schedules';
import { Frequency } from '$app/common/enums/frequency';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setSchedule: Dispatch<SetStateAction<Schedule | undefined>>;
  schedule: Schedule | undefined;
}

export const DEFAULT_SCHEDULE_PARAMETERS: Parameters = {
  clients: [],
  date_range: 'last7_days',
  show_aging_table: false,
  show_credits_table: false,
  show_payments_table: false,
  only_clients_with_invoices: false,
  status: 'all',
  entity: 'invoice',
  entity_id: '',
  report_name: 'activity',
  start_date: '',
  end_date: '',
  product_key: '',
  send_email: true,
  is_expense_billed: false,
  is_income_billed: false,
  include_tax: false,
  document_email_attachment: false,
  client_id: '',
  vendors: '',
  projects: '',
  categories: '',
  report_keys: [],
};

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
        parameters: {
          ...DEFAULT_SCHEDULE_PARAMETERS,
        },
      }));
    } else if (
      property === ('parameters.report_name' as keyof Schedule) &&
      blankSchedule
    ) {
      setSchedule(
        (current) =>
          current && {
            ...current,
            parameters: {
              ...DEFAULT_SCHEDULE_PARAMETERS,
              report_name: value as string,
            },
          }
      );
    } else {
      if (property === ('parameters.entity' as keyof Schedule)) {
        setSchedule(set(schedule as Schedule, 'parameters.entity_id', ''));
      }

      setSchedule(set(schedule as Schedule, property, value));
    }
  };
}
