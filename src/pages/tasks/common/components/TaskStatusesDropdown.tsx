/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useTaskStatusesQuery } from '$app/common/queries/task-statuses';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import Tippy from '@tippyjs/react/headless';
import { Dispatch, SetStateAction } from 'react';
import { useUpdateTask } from '../hooks/useUpdateTask';
import { Task } from '$app/common/interfaces/task';

interface Props {
  visible: boolean;
  isFormBusy: boolean;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  setVisible: Dispatch<SetStateAction<boolean>>;
  task: Task;
}
export function TaskStatusesDropdown(props: Props) {
  const colors = useColorScheme();

  const { visible, isFormBusy, setIsFormBusy, task, setVisible } = props;

  const { data: taskStatuses } = useTaskStatusesQuery({
    status: 'active',
  });

  const handleUpdateTask = useUpdateTask({
    isFormBusy,
    setIsFormBusy,
  });

  return (
    <Tippy
      placement="bottom"
      interactive={true}
      render={() => (
        <div
          className="border box rounded-md shadow-lg focus:outline-none"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$4,
            minWidth: '12rem',
            maxWidth: '14.7rem',
          }}
        >
          {taskStatuses?.data.map(
            (taskStatus, index) =>
              taskStatus.id !== task.status_id && (
                <DropdownElement
                  key={index}
                  onClick={() => {
                    setVisible(false);
                    handleUpdateTask({ ...task, status_id: taskStatus.id });
                  }}
                >
                  {taskStatus.name}
                </DropdownElement>
              )
          )}
        </div>
      )}
      visible={visible}
    >
      <div></div>
    </Tippy>
  );
}
