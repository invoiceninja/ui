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

const TemplateProperties = {
  EMAIL_STATEMENT: [
    'template',
    'next_run',
    'frequency_id',
    'remaining_cycles',
    'parameters',
  ],
  EMAIL_RECORD: ['template', 'next_run', 'parameters'],
  EMAIL_REPORT: [
    'template',
    'next_run',
    'frequency_id',
    'remaining_cycles',
    'parameters',
  ],
};

const TemplateParametersProperties = {
  EMAIL_STATEMENT: [
    'date_range',
    'status',
    'show_aging_table',
    'show_credits_table',
    'show_payments_table',
    'clients',
  ],
  EMAIL_RECORD: ['entity', 'entity_id'],
  EMAIL_REPORT: ['report_name', 'date_range'],
};

export function useFormatSchedulePayload() {
  return (schedule: Schedule) => {
    let formattedSchedule = {};

    const scheduleMainProperties =
      TemplateProperties[
        schedule.template.toUpperCase() as keyof typeof TemplateProperties
      ];

    const scheduleParametersProperties =
      TemplateParametersProperties[
        schedule.template.toUpperCase() as keyof typeof TemplateParametersProperties
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

    return formattedSchedule;
  };
}
