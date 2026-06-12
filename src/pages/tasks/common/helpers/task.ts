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

  const lastLog = logs[logs.length - 1];
  const lastStop = lastLog[1];
  const currentUtcUnix = dayjs.utc().unix();

  if (lastStop > currentUtcUnix) {
    return false;
  }

  return true;
}
