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
import { useTranslation } from 'react-i18next';
import { useEntityNumber } from '../hooks/useEntityNumber';
import { Templates } from './ScheduleForm';

interface Props {
  schedule: Schedule;
}

export function ScheduleName({ schedule }: Props) {
  const [t] = useTranslation();

  const entityNumber = useEntityNumber({
    entity:
      schedule.template === Templates.EMAIL_RECORD
        ? schedule.parameters.entity
        : undefined,
    entityId:
      schedule.template === Templates.EMAIL_RECORD
        ? schedule.parameters.entity_id
        : undefined,
    enabled: Boolean(schedule && !schedule.name),
  });

  if (schedule.name) {
    return <>{schedule.name}</>;
  }

  if (schedule.template === Templates.EMAIL_RECORD) {
    const base = `${t(schedule.template as string)}: ${t(
      schedule.parameters.entity
    )}`;

    return <>{entityNumber ? `${base} #${entityNumber}` : base}</>;
  }

  if (schedule.template === Templates.EMAIL_REPORT) {
    return (
      <>
        {`${t(schedule.template as string)}: ${t(
          schedule.parameters.report_name
        )} | ${t(schedule.parameters.date_range)}`}
      </>
    );
  }

  if (schedule.template === Templates.PAYMENT_SCHEDULE) {
    return <>{schedule.name}</>;
  }

  if (schedule.template === Templates.INVOICE_OUTSTANDING_TASKS) {
    return <>{schedule.name}</>;
  }

  return (
    <>
      {`${t(schedule.template as string)}: ${t(
        schedule.parameters.date_range
      )}`}
    </>
  );
}
