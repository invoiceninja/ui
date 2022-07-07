/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Task } from 'common/interfaces/task';
import { useTaskQuery } from 'common/queries/tasks';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function Edit() {
  const { id } = useParams();
  const { data } = useTaskQuery({ id });

  const [task, setTask] = useState<Task>();

  useEffect(() => {
    if (data) {
      setTask(data);
    }
  }, [data]);

  return <div></div>;
}
