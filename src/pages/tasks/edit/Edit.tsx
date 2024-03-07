/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Task } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useOutletContext } from 'react-router-dom';
import { TaskDetails } from '../common/components/TaskDetails';
import { TaskTable } from '../common/components/TaskTable';

export interface Context {
  errors: ValidationBag | undefined;
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => void;
}
export default function Edit() {
  const context: Context = useOutletContext();

  const { task, errors, handleChange } = context;

  return (
    <>
      {task && (
        <TaskDetails
          task={task}
          handleChange={handleChange}
          errors={errors}
          page="edit"
        />
      )}

      {task && <TaskTable task={task} handleChange={handleChange} />}
    </>
  );
}
