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
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

interface Props {
  task: Task;
  calculateLastTimeLog?: boolean;
}

export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

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

  return <p>{isTaskActive && formatTime(seconds)}</p>;
}
