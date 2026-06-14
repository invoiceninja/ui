/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Task } from '$app/common/interfaces/task';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { parseTimeLog } from './calculate-time';
import { isTaskRunning } from './calculate-entity-state';

dayjs.extend(utc);

export function shouldShowStartTaskButton(task: Task) {
  if (task.invoice_id) {
    return false;
  }

  if (isTaskRunning(task)) {
    return false;
  }

  const logs = parseTimeLog(task.time_log);

  if (!logs.length) {
    return true;
  }

  const currentUtcUnix = dayjs.utc().unix();

  const hasFutureTimeLog = logs.some(
    ([start, stop]) => start > currentUtcUnix || stop > currentUtcUnix
  );

  if (hasFutureTimeLog) {
    return false;
  }

  return true;
}
