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
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Project } from '$app/common/interfaces/project';
import { Task } from '$app/common/interfaces/task';
import { useQueryClient } from 'react-query';

export function useCombineProjectsTasks() {
  const queryClient = useQueryClient();

  return async (
    selectedIds: string[],
    selectedProjects: Project[] | undefined
  ) => {
    let tasks: Task[] | null = null;

    const clientIdsOfSelectedProjects = selectedProjects?.map(
      (project) => project.client_id
    );

    if (clientIdsOfSelectedProjects?.length) {
      const clientId = clientIdsOfSelectedProjects[0];

      const isAnyClientDifferent = clientIdsOfSelectedProjects.some(
        (id) => id !== clientId
      );

      if (isAnyClientDifferent) {
        return tasks;
      }
    }

    tasks = [];

    toast.processing();

    const fetchTasks = selectedIds.map((projectId) => {
      return queryClient
        .fetchQuery(
          ['/api/v1/tasks', 'project_tasks', projectId, 'active'],
          () =>
            request(
              'GET',
              endpoint(
                '/api/v1/tasks?project_tasks=:projectId&per_page=100&status=active',
                {
                  projectId,
                }
              )
            ),
          { staleTime: Infinity }
        )
        .then((response: GenericSingleResourceResponse<Task[]>) => {
          const unInvoicedTasks = response.data.data.filter(
            (task) => !task.invoice_id
          );

          if (tasks !== null) {
            tasks = [...tasks, ...unInvoicedTasks];
          }
        });
    });

    toast.dismiss();

    await Promise.all(fetchTasks);

    return tasks;
  };
}
