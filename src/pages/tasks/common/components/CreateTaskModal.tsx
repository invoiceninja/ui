/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { Task } from 'common/interfaces/task';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankTaskQuery } from 'common/queries/tasks';
import { Modal } from 'components/Modal';
import { TaskDetails } from 'pages/tasks/common/components/TaskDetails';
import { TaskTable } from 'pages/tasks/common/components/TaskTable';
import { isOverlapping } from 'pages/tasks/common/helpers/is-overlapping';
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export interface TaskDetails {
  taskStatusId: string;
  projectId?: string;
}

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  details: TaskDetails | undefined;
  apiEndPoint: string;
}

export function CreateTaskModal(props: Props) {
  const [t] = useTranslation();

  const { data } = useBlankTaskQuery();

  const queryClient = useQueryClient();

  const [task, setTask] = useState<Task>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  const handleSave = (event: FormEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (task && !isFormBusy) {
      setIsFormBusy(true);

      toast.processing();

      if (isOverlapping(task)) {
        return toast.error('task_errors');
      }

      request('POST', endpoint('/api/v1/tasks'), task)
        .then(() => {
          toast.success('created_task');

          queryClient.invalidateQueries('/api/v1/tasks?per_page=1000');

          queryClient.invalidateQueries(
            task.project_id &&
              route('/api/v1/tasks?project_tasks=:project_id&per_page=1000', {
                project_id: task.project_id,
              })
          );

          setTask(data);

          props.setVisible(false);
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
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (data && props.details) {
      setTask({
        ...data,
        status_id: props.details.taskStatusId,
        project_id: props.details.projectId ? props.details.projectId : '',
      });
    }
  }, [data, props.details]);

  return (
    <Modal
      title={t('new_task')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
      size="large"
    >
      {task && (
        <TaskDetails
          task={task}
          handleChange={handleChange}
          errors={errors}
          taskModal={true}
        />
      )}
      {task && <TaskTable task={task} handleChange={handleChange} />}

      <Button
        className="self-end"
        onClick={handleSave}
        disabled={!task || isFormBusy}
        disableWithoutIcon
      >
        {t('save')}
      </Button>
    </Modal>
  );
}
