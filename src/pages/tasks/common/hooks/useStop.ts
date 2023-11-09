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
import dayjs from 'dayjs';
import { isOverlapping } from '../helpers/is-overlapping';
import { $refetch } from '$app/common/hooks/useRefetch';

export function useStop() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (task: Task) => {
    toast.processing();

    const logs = parseTimeLog(task.time_log);

    const startTime = logs[logs.length - 1][0];
    const currentTime = dayjs().unix();

    if (startTime && startTime > currentTime) {
      logs[logs.length - 1][1] = startTime + 1;

      task.time_log = JSON.stringify(logs);
    } else {
      if (isOverlapping(task)) {
        return toast.error('task_errors');
      }
    }

    request(
      'PUT',
      endpoint('/api/v1/tasks/:id?stop=true', { id: task.id }),
      task
    ).then(() => {
      toast.success('stopped_task');

      $refetch(['tasks']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
}
