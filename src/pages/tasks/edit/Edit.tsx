/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Task } from 'common/interfaces/task';
import { useTaskQuery } from 'common/queries/tasks';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { TaskDetails } from '../common/components/TaskDetails';
import { TaskTable } from '../common/components/TaskTable';

export function Edit() {
  const { documentTitle } = useTitle('edit_task');

  const { id } = useParams();
  const { data } = useTaskQuery({ id });

  const [t] = useTranslation();
  const [task, setTask] = useState<Task>();

  useEffect(() => {
    if (data) {
      setTask(data);
    }
  }, [data]);

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  return (
    <Default title={documentTitle}>
      {task && <TaskDetails task={task} handleChange={handleChange} />}
      {task && <TaskTable task={task} handleChange={handleChange} />}
    </Default>
  );
}
