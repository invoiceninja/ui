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
import { useLocation } from 'react-router-dom';

export function useStart() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);
  const location = useLocation();

  return (task: Task) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/tasks/:id?start=true', { id: task.id }),
      task
    )
      .then(() => {
        !location.pathname.endsWith('/create')
          ? toast.success('started_task')
          : toast.dismiss();

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
