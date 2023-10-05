/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Task } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTaskQuery } from '$app/common/queries/tasks';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TaskDetails } from '../common/components/TaskDetails';
import { TaskTable } from '../common/components/TaskTable';
import { ResourceActions } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { useActions } from '../common/hooks';
import { useUpdateTask } from '../common/hooks/useUpdateTask';

export default function Edit() {
  const { documentTitle } = useTitle('edit_task');
  const { id } = useParams();
  const { data } = useTaskQuery({ id });

  const [t] = useTranslation();

  const [task, setTask] = useState<Task>();

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const actions = useActions();

  useEffect(() => {
    if (data) {
      setTask(data);
    }
  }, [data]);

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const handleSave = useUpdateTask({ isFormBusy, setIsFormBusy, setErrors });

  return (
    <Default
      title={documentTitle}
      disableSaveButton={isFormBusy}
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
