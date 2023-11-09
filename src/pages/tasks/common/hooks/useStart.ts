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
import { useLocation } from 'react-router-dom';
import { $refetch } from '$app/common/hooks/useRefetch';

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
    ).then(() => {
      !location.pathname.endsWith('/create')
        ? toast.success('started_task')
        : toast.dismiss();

      $refetch(['tasks']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
}
