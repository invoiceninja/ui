/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Task } from '$app/common/interfaces/task';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { parseTimeLog } from '../helpers/calculate-time';
import { $refetch } from '$app/common/hooks/useRefetch';

export function useResume() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (task: Task) => {
    toast.processing();

    const logs = parseTimeLog(task.time_log);

    if (logs.length === 0) {
      toast.error('no_timelog_entry');
      return;
    }

    const lastEntry = logs[logs.length - 1];

    if (lastEntry[1] === 0) {
      toast.error('task_already_running');
      return;
    }

    // Reopen the last entry by clearing its end time
    logs[logs.length - 1][1] = 0;

    const updatedTask = {
      ...task,
      time_log: JSON.stringify(logs),
    };

    request(
      'PUT',
      endpoint('/api/v1/tasks/:id?start=true', { id: task.id }),
      updatedTask
    ).then(() => {
      toast.success('started_task');

      $refetch(['tasks']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
}

/**
 * Returns true if the task has a recently stopped entry (within 60 min)
 */
export function canResumeLastEntry(task: Task): boolean {
  const logs = parseTimeLog(task.time_log);

  if (logs.length === 0) return false;

  const lastEntry = logs[logs.length - 1];
  const lastEndTime = lastEntry[1];

  if (!lastEndTime || lastEndTime === 0) return false;

  const now = Math.floor(Date.now() / 1000);
  const minutesSinceStopped = (now - lastEndTime) / 60;

  return minutesSinceStopped <= 60;
}