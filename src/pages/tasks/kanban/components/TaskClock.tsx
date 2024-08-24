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
import { isTaskRunning } from '$app/pages/tasks/common/helpers/calculate-entity-state';
import { calculateTime } from '$app/pages/tasks/common/helpers/calculate-time';
import { useEffect, useRef, useState } from 'react';

interface Props {
  task: Task;
  calculateLastTimeLog?: boolean;
}

export function TaskClock(props: Props) {
  const [seconds, setSeconds] = useState<number>(0);

  const isTaskActive = props.task && isTaskRunning(props.task);

  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );

  const handleVisibilityChange = () => {
    const calculation = calculateTime(props.task.time_log, {
      inSeconds: true,
      calculateLastTimeLog: Boolean(props.calculateLastTimeLog),
    });

    if (isTaskActive) {
      setSeconds(Number(calculation));

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setSeconds((current) => current + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    const calculation = calculateTime(props.task.time_log, {
      inSeconds: true,
      calculateLastTimeLog: Boolean(props.calculateLastTimeLog),
    });

    if (isTaskActive) {
      setSeconds(Number(calculation));

      intervalRef.current = setInterval(() => {
        setSeconds((current) => current + 1);
      }, 1000);

      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [props.task.updated_at]);

  return (
    <p>
      {isTaskActive && new Date(seconds * 1000).toISOString().slice(11, 19)}
    </p>
  );
}
