/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useUpdateAtom } from 'jotai/utils';
import { Statement } from 'pages/clients/statement/Statement';
import { scheduleParametersAtom } from 'pages/settings/schedules/common/atoms';
import { useNavigate } from 'react-router-dom';

export function useScheduleStatement() {
  const navigate = useNavigate();

  const setScheduleParameters = useUpdateAtom(scheduleParametersAtom);

  return (statement: Statement) => {
    setScheduleParameters({
      clients: [statement.client_id],
      show_aging_table: statement.show_aging_table,
      show_payments_table: statement.show_payments_table,
      status: statement.status,
      date_range:
        statement.dateRangeId === 'custom'
          ? 'last7_days'
          : statement.dateRangeId,
    });

    navigate('/settings/schedules/create?template=email_statement');
  };
}
