/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Statement } from '$app/pages/clients/statement/Statement';
import { scheduleParametersAtom } from '$app/pages/settings/schedules/common/components/EmailStatement';
import { DEFAULT_SCHEDULE_PARAMETERS } from '$app/pages/settings/schedules/common/hooks/useHandleChange';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

export function useScheduleStatement() {
  const navigate = useNavigate();

  const setScheduleParameters = useSetAtom(scheduleParametersAtom);

  return (statement: Statement) => {
    setScheduleParameters({
      ...DEFAULT_SCHEDULE_PARAMETERS,
      clients: [statement.client_id],
      show_aging_table: statement.show_aging_table,
      show_credits_table: statement.show_credits_table,
      show_payments_table: statement.show_payments_table,
      only_clients_with_invoices: statement.only_clients_with_invoices,
      status: statement.status,
      date_range:
        statement.dateRangeId === 'custom'
          ? 'last7_days'
          : statement.dateRangeId,
      entity: 'invoice',
    });

    navigate('/settings/schedules/create?template=email_statement');
  };
}
