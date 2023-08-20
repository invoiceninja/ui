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
  entity: 'invoice' | 'credit' | 'quote' | 'purchase_order';
}

export function useScheduleEmailRecord({ entity }: Props) {
  const navigate = useNavigate();

  const setScheduleParameters = useSetAtom(scheduleParametersAtom);

  return (entityId: string) => {
    setScheduleParameters({
      clients: [],
      show_aging_table: false,
      show_credits_table: false,
      show_payments_table: false,
      only_clients_with_invoices: false,
      status: 'all',
      date_range: 'last7_days',
      entity,
      entity_id: entityId,
    });

    navigate('/settings/schedules/create?template=email_record');
  };
}
