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
import { DEFAULT_SCHEDULE_PARAMETERS } from '$app/pages/settings/schedules/common/hooks/useHandleChange';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

interface Props {
  entity: 'invoice' | 'credit' | 'quote' | 'purchase_order';
}

export function useScheduleEmailRecord({ entity }: Props) {
  const navigate = useNavigate();

  const setScheduleParameters = useSetAtom(scheduleParametersAtom);

  return (entityId: string) => {
    setScheduleParameters({
      ...DEFAULT_SCHEDULE_PARAMETERS,
      entity,
      entity_id: entityId,
    });

    navigate('/settings/schedules/create?template=email_record');
  };
}
