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
import { useTitle } from 'common/hooks/useTitle';
import { Task } from 'common/interfaces/task';
import { useTaskQuery } from 'common/queries/tasks';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { TaskDetails } from '../common/components/TaskDetails';
import { TaskTable } from '../common/components/TaskTable';
import { Actions } from './components/Actions';

export function Edit() {
  const { documentTitle } = useTitle('edit_task');

  const { id } = useParams();
  const { data } = useTaskQuery({ id });

  const [t] = useTranslation();
  const [task, setTask] = useState<Task>();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      setTask(data);
    }
  }, [data]);

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const handleSave = (task: Task) => {
    const toastId = toast.loading(t('processing'));

    request('PUT', endpoint('/api/v1/tasks/:id', { id: task.id }), task)
      .then(() => toast.success(t('updated_task'), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/tasks/:id', { id: task.id })
        )
      );
  };

  return (
    <Default
      title={documentTitle}
      onBackClick={generatePath('/tasks')}
      // navigationTopRight={task && <Actions task={task} />}
      onSaveClick={() => task && handleSave(task)}
    >
      {task && <TaskDetails task={task} handleChange={handleChange} />}
      {task && <TaskTable task={task} handleChange={handleChange} />}
    </Default>
  );
}
