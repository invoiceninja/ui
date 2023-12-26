/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Schedule } from '$app/common/interfaces/schedule';
import { DataTableColumns } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';
import frequencies from '$app/common/constants/frequency';
import { Templates } from '$app/pages/settings/schedules/common/components/ScheduleForm';

export function useScheduleColumns() {
  const [t] = useTranslation();

  const columns: DataTableColumns<Schedule> = [
    {
      id: 'name',
      label: t('name'),
      format: (value, schedule) => {
        if (schedule.template === Templates.EMAIL_RECORD) {
          return `${t(schedule.template as string)}: ${t(
            schedule.parameters.entity
          )}`;
        }

        if (schedule.template === Templates.EMAIL_REPORT) {
          return `${t(schedule.template as string)}: ${t(
            schedule.parameters.report_name
          )} | ${t(schedule.parameters.date_range)}`;
        }

        return `${t(schedule.template as string)}: ${t(
          schedule.parameters.date_range
        )}`;
      },
    },
    {
      id: 'next_run',
      label: t('next_run'),
    },
    {
      id: 'frequency_id',
      label: t('frequency'),
      format: (value) => t(frequencies[value as keyof typeof frequencies]),
    },
  ];

  return columns;
}
