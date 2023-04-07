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
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

interface Props {
  entity: string;
}

export function useScheduleEmailRecord(props: Props) {
  const navigate = useNavigate();

  const { entity } = props;

  const setScheduleParameters = useSetAtom(scheduleParametersAtom);

  return (entity_id: string) => {
    setScheduleParameters({
      clients: [],
      show_aging_table: false,
      show_payments_table: false,
      status: 'all',
      date_range: 'last7_days',
      entity,
      entity_id,
    });

    navigate('/settings/schedules/create?template=email_record');
  };
}
