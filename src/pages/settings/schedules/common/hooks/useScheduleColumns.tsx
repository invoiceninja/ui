/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import frequencies from '$app/common/constants/frequency';
import { Schedule } from '$app/common/interfaces/schedule';
import { DataTableColumns } from '$app/components/DataTable';
import { ScheduleName } from '$app/pages/settings/schedules/common/components/ScheduleName';
import { ScheduleEntityLink } from '$app/pages/settings/schedules/common/components/ScheduleEntityLink';
import { DynamicLink } from '$app/components/DynamicLink';
import { route } from '$app/common/helpers/route';

export function useScheduleColumns() {
  const [t] = useTranslation();

  const columns: DataTableColumns<Schedule> = [
    {
      id: 'name',
      label: t('name'),
      format: (_, schedule) => (
        <DynamicLink
          to={route('/settings/schedules/:id/edit', { id: schedule.id })}
        >
          <ScheduleName schedule={schedule} />
        </DynamicLink>
      ),
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
    {
      id: 'related_entity',
      label: t('link'),
      format: (_, schedule) => <ScheduleEntityLink schedule={schedule} />,
    },
  ];

  return columns;
}
