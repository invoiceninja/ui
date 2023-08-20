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
import { useTitle } from '$app/common/hooks/useTitle';
import { Task } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTaskQuery } from '$app/common/queries/tasks';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import { TaskDetails } from '../common/components/TaskDetails';
import { TaskTable } from '../common/components/TaskTable';
import { isOverlapping } from '../common/helpers/is-overlapping';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { ResourceActions } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { useActions } from '../common/hooks';

export default function Edit() {
  const { documentTitle } = useTitle('edit_task');
  const { id } = useParams();
  const { data } = useTaskQuery({ id });

  const [t] = useTranslation();

  const [task, setTask] = useState<Task>();

  const [errors, setErrors] = useState<ValidationBag>();

  const queryClient = useQueryClient();

  const actions = useActions();

  useEffect(() => {
    if (data) {
      setTask(data);
    }
  }, [data]);

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const saveCompany = useHandleCompanySave();

  const handleSave = async (task: Task) => {
    toast.processing();

    await saveCompany(true);

    if (isOverlapping(task)) {
      return toast.error('task_errors');
    }

    request('PUT', endpoint('/api/v1/tasks/:id', { id: task.id }), task)
      .then(() => {
        toast.success('updated_task');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      })
      .finally(() =>
        queryClient.invalidateQueries(route('/api/v1/tasks/:id', { id }))
      );
  };

  return (
    <Default
      title={documentTitle}
      onSaveClick={() => task && handleSave(task)}
      navigationTopRight={
        task && (
          <ResourceActions
            label={t('more_actions')}
            resource={task}
            actions={actions}
          />
        )
      }
    >
      {task && (
        <TaskDetails
          task={task}
          handleChange={handleChange}
          errors={errors}
          page="edit"
        />
      )}
      {task && <TaskTable task={task} handleChange={handleChange} />}
    </Default>
  );
}
