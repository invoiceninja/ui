/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { Task } from 'common/interfaces/task';
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from 'common/atoms/data-table';
import { parseTimeLog } from '../helpers/calculate-time';
import dayjs from 'dayjs';
import { isOverlapping } from '../helpers/is-overlapping';

export function useStop() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (task: Task) => {
    toast.processing();

    const logs = parseTimeLog(task.time_log);

    logs[logs.length - 1][1] = dayjs().unix();

    task.time_log = JSON.stringify(logs);

    if (isOverlapping(task)) {
      return toast.error('task_errors');
    }

    request(
      'PUT',
      endpoint('/api/v1/tasks/:id?stop=true', { id: task.id }),
      task
    )
      .then(() => {
        toast.success('stopped_task');

        queryClient.invalidateQueries('/api/v1/tasks');

        queryClient.invalidateQueries(
          route('/api/v1/tasks/:id', { id: task.id })
        );

        queryClient.invalidateQueries('/api/v1/tasks?per_page=1000');

        queryClient.invalidateQueries(
          route('/api/v1/tasks?project_tasks=:projectId&per_page=1000', {
            projectId: task.project_id,
          })
        );

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      });
  };
}
