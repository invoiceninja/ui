/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { Task } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTaskQuery } from '$app/common/queries/tasks';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { TaskDetails } from '../common/components/TaskDetails';
import { TaskTable } from '../common/components/TaskTable';
import { isOverlapping } from '../common/helpers/is-overlapping';
import { Actions } from './components/Actions';

export function Edit() {
  const { documentTitle } = useTitle('edit_task');
  const { id } = useParams();
  const { data } = useTaskQuery({ id });

  const [task, setTask] = useState<Task>();

  const [errors, setErrors] = useState<ValidationBag>();

  const queryClient = useQueryClient();
  const company = useInjectCompanyChanges();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      setTask(data);
    }
  }, [data]);

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const handleSave = (task: Task) => {
    toast.processing();

    if (isOverlapping(task)) {
      return toast.error('task_errors');
    }

    axios
      .all([
        request('PUT', endpoint('/api/v1/tasks/:id', { id: task.id }), task),
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        ),
      ])
      .then((response) => {
        toast.success('updated_task');

        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        } else {
          console.error(error);
          toast.error();
        }
      })
      .finally(() =>
        queryClient.invalidateQueries(route('/api/v1/tasks/:id', { id }))
      );
  };

  return (
    <Default
      title={documentTitle}
      onBackClick={route('/tasks')}
      navigationTopRight={task && <Actions task={task} />}
      onSaveClick={() => task && handleSave(task)}
    >
      {task && (
        <TaskDetails task={task} handleChange={handleChange} errors={errors} />
      )}
      {task && <TaskTable task={task} handleChange={handleChange} />}
    </Default>
  );
}
