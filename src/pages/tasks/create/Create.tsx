/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { Task } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTaskStatusesQuery } from '$app/common/queries/task-statuses';
import { useBlankTaskQuery } from '$app/common/queries/tasks';
import { Default } from '$app/components/layouts/Default';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { taskAtom } from '../common/atoms';
import { TaskDetails } from '../common/components/TaskDetails';
import { TaskTable } from '../common/components/TaskTable';
import { isOverlapping } from '../common/helpers/is-overlapping';
import { useStart } from '../common/hooks/useStart';
import { $refetch } from '$app/common/hooks/useRefetch';

export default function Create() {
  const [t] = useTranslation();
  const { documentTitle } = useTitle('new_task');

  const company = useCurrentCompany();
  const start = useStart();
  const navigate = useNavigate();

  const [task, setTask] = useAtom(taskAtom);
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState<ValidationBag>();

  const [isInitialConfiguration, setIsInitialConfiguration] =
    useState<boolean>(true);

  const { data: taskStatuses } = useTaskStatusesQuery({ status: 'active' });
  const { data } = useBlankTaskQuery({ enabled: typeof task === 'undefined' });

  const pages = [
    { name: t('tasks'), href: '/tasks' },
    { name: t('new_task'), href: '/tasks/create' },
  ];

  useEffect(() => {
    setTask((current) => {
      let value = current;

      if (searchParams.get('action') !== 'clone') {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const _task = cloneDeep(data);

        if (searchParams.get('client')) {
          _task.client_id = searchParams.get('client')!;
        }

        if (searchParams.get('project')) {
          _task.project_id = searchParams.get('project')!;
        }

        _task.rate = company?.settings?.default_task_rate || 0;

        if (searchParams.get('rate')) {
          _task.rate = parseFloat(searchParams.get('rate')!);
        }

        value = _task;
      }

      return value;
    });
  }, [data]);

  useEffect(() => {
    if (task && taskStatuses && isInitialConfiguration) {
      setTask(
        (current) =>
          current && {
            ...current,
            status_id:
              taskStatuses.data.length > 0 ? taskStatuses.data[0].id : '',
          }
      );

      setIsInitialConfiguration(false);
    }
  }, [task, taskStatuses]);

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const handleSave = (task: Task) => {
    toast.processing();

    if (isOverlapping(task)) {
      return toast.error('task_errors');
    }

    request('POST', endpoint('/api/v1/tasks'), task)
      .then((response) => {
        company?.auto_start_tasks && start(response.data.data);

        $refetch(['tasks']);

        toast.success('created_task');

        navigate(route('/tasks/:id/edit', { id: response.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };

  return (
    <Default
      title={documentTitle}
      onSaveClick={() => task && handleSave(task)}
      breadcrumbs={pages}
    >
      {task && (
        <TaskDetails task={task} handleChange={handleChange} errors={errors} />
      )}
      {task && <TaskTable task={task} handleChange={handleChange} />}
    </Default>
  );
}
