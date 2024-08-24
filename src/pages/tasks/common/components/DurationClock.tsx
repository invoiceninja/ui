/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { isTaskRunning } from '../helpers/calculate-entity-state';
import { Task } from '$app/common/interfaces/task';
import { PauseCircle } from 'react-feather';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useStop } from '../hooks/useStop';

interface Props {
  start: number;
  task: Task;
}

export function DurationClock({ start, task }: Props) {
  const [elapsedTime, setElapsedTime] = useState(
    Math.floor(Date.now() / 1000) - start
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setElapsedTime(Math.floor(Date.now() / 1000) - start);
  }, [start]);

  const formatTime = (seconds: number) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  };

  const accent = useAccentColor();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const stop = useStop();

  return (
    <span className="flex items-center space-x-2">
      <span>{formatTime(elapsedTime)}</span>

      {isTaskRunning(task) && !task.invoice_id && (
        <PauseCircle
          className="cursor-pointer"
          color="#808080"
          size={24}
          stroke={accent}
          strokeWidth="1"
          onClick={() =>
            (hasPermission('edit_task') || entityAssigned(task)) && stop(task)
          }
          cursor={
            hasPermission('edit_task') || entityAssigned(task)
              ? 'pointer'
              : 'not-allowed'
          }
        />
      )}
    </span>
  );
}
