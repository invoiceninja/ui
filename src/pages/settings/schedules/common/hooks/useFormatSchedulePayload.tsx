/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Parameters, Schedule } from '$app/common/interfaces/schedule';
import { useTemplateParametersProperties } from './useTemplateParametersProperties';

interface Params {
  schedule: Schedule | undefined;
}

const TemplateProperties = {
  email_statement: [
    'template',
    'next_run',
    'frequency_id',
    'remaining_cycles',
    'parameters',
  ],
  email_record: ['template', 'next_run', 'parameters'],
  email_report: [
    'template',
    'next_run',
    'frequency_id',
    'remaining_cycles',
    'parameters',
  ],
};

const NullableProperties = ['vendors', 'projects', 'categories'];

export function useFormatSchedulePayload(params: Params) {
  const { schedule } = params;

  const templateParametersProperties = useTemplateParametersProperties({
    schedule,
  });

  return () => {
    if (schedule) {
      let formattedSchedule = {};

      const scheduleMainProperties =
        TemplateProperties[
          schedule.template as keyof typeof TemplateProperties
        ];
      const scheduleParametersProperties =
        templateParametersProperties[
          schedule.template as keyof typeof templateParametersProperties
        ];

      Object.entries(schedule.parameters).forEach(([property]) => {
        if (!scheduleParametersProperties.includes(property)) {
          delete schedule.parameters[property as keyof Parameters];
        }
      });

      Object.entries(schedule).forEach(([property, value]) => {
        if (scheduleMainProperties.includes(property)) {
          formattedSchedule = { ...formattedSchedule, [property]: value };
        }
      });

      Object.entries(schedule.parameters).forEach(([property, value]) => {
        if (NullableProperties.includes(property)) {
          formattedSchedule = {
            ...formattedSchedule,
            parameters: {
              ...(formattedSchedule[
                'parameters' as keyof typeof formattedSchedule
              ] as object),
              [property]: value || '',
            },
          };
        }
      });

      return formattedSchedule;
    }
  };
}
