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

export function isOverlapping(task: Task) {
  let overlaps = false;

  const logs = parseTimeLog(task.time_log);
  const sorted = logs.sort((a, b) => a[0] - b[0]);

  sorted.forEach(([, stop], index) => {
    const next = sorted[index + 1];

    if (next && stop > next[0]) {
      overlaps = true;
    }
  });

  return overlaps;
}
