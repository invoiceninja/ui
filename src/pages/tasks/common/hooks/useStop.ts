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
import { generatePath } from 'react-router-dom';

export function useStop() {
  const queryClient = useQueryClient();

  return (task: Task) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/tasks/:id?stop=true', { id: task.id }),
      task
    )
      .then(() => toast.success('stopped_task'))
      .catch((error) => {
        console.error(error);

        toast.error();
      })
      .finally(() => {
        queryClient.invalidateQueries('/api/v1/tasks');

        queryClient.invalidateQueries(
          generatePath('/api/v1/tasks/:id', { id: task.id })
        );
      });
  };
}
