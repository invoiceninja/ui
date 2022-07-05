/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Task } from 'common/interfaces/task';
import { parseTimeLog } from './calculate-time';

export function calculateEntityState(task: Task) {
  if (task.invoice_id) {
    return 'invoiced';
  }

  let running = false;

  parseTimeLog(task.time_log).forEach(([, stop]) => {
    if (stop === 0) {
      running = true;
    }
  });

  if (running) {
    return 'active';
  }

  return 'logged';
}
