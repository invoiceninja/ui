/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { scheduleParametersAtom } from '$app/pages/settings/schedules/common/components/EmailStatement';
import { blankScheduleParameters } from '$app/pages/settings/schedules/create/Create';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Identifier } from '../../index/Reports';

export function useScheduleReport() {
  const navigate = useNavigate();

  const setScheduleParameters = useSetAtom(scheduleParametersAtom);

  return (reportIdentifier: Identifier, dateRange: string) => {
    setScheduleParameters({
      ...blankScheduleParameters,
      date_range: dateRange === 'all' ? 'last7_days' : dateRange,
      report_name: reportIdentifier,
    });

    navigate('/settings/schedules/create?template=email_report');
  };
}
