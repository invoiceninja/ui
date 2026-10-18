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
import { KeyboardEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Project } from '$app/common/interfaces/project';
import { Task } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTaskStatusesQuery } from '$app/common/queries/task-statuses';
import { useBlankTaskQuery } from '$app/common/queries/tasks';
import { Plus } from '$app/components/icons/Plus';

interface Props {
  project: Project;
}

const CreateButton = styled.button`
  color: ${({ theme }) => theme.color};

  &:hover {
    color: ${({ theme }) => theme.hoverColor};
  }
`;

export function QuickCreateTask({ project }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { data: blankTask } = useBlankTaskQuery();
  const { data: taskStatuses } = useTaskStatusesQuery({ status: 'active' });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');

  const queue = useRef<Promise<void>>(Promise.resolve());

  const createTask = (value: string) => {
    if (!blankTask) {
      return;
    }

    const task: Task = {
      ...blankTask,
      description: value,
      project_id: project.id,
      client_id: project.client_id,
      rate: project.task_rate,
      status_id: taskStatuses?.data.length
        ? taskStatuses.data[0].id
        : blankTask.status_id,
    };

    queue.current = queue.current.then(() => {
      toast.processing();

      return request('POST', endpoint('/api/v1/tasks'), task)
        .then(() => {
          toast.success('created_task');

          $refetch(['tasks']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          setIsEditing(true);
          setDescription((current) => current || value);

          if (error.response?.status === 422) {
            const messages = Object.values(
              error.response.data.errors ?? {}
            ).flat();

            toast.error(messages[0] || error.response.data.message);

            return;
          }

          toast.error();
        });
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setDescription('');
      setIsEditing(false);

      return;
    }

    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const value = description.trim();

    if (!value || !blankTask) {
      return;
    }

    setDescription('');
    createTask(value);
  };

  const handleBlur = () => {
    if (!description.trim()) {
      setDescription('');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <CreateButton
        type="button"
        onClick={() => setIsEditing(true)}
        theme={{ color: colors.$17, hoverColor: colors.$3 }}
        className="flex items-center space-x-2 w-full text-sm focus:outline-none"
      >
        <Plus size="1rem" color="currentColor" />

        <span>{t('create')}</span>
      </CreateButton>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Plus size="1rem" color={colors.$17} />

      <input
        type="text"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={`${t('new_task')} ↵`}
        className="flex-1 min-w-0 bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
        style={{ color: colors.$3 }}
        autoFocus
      />
    </div>
  );
}
