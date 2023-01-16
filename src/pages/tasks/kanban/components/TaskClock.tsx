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
import { isTaskRunning } from 'pages/tasks/common/helpers/calculate-entity-state';
import { calculateTime } from 'pages/tasks/common/helpers/calculate-time';
import { useEffect, useState } from 'react';

interface Props {
  task: Task;
  calculateLastTimeLog?: boolean;
}

export function TaskClock(props: Props) {
  const [seconds, setSeconds] = useState<number>(0);

  const isTaskActive = props.task && isTaskRunning(props.task);

  let alreadySetInterval = false;

  let mounted = false;

  let mainIntervalLocalValue: ReturnType<typeof setInterval> | undefined =
    undefined;

  useEffect(() => {
    const calculation = calculateTime(props.task.time_log, {
      inSeconds: true,
      calculateLastTimeLog: Boolean(props.calculateLastTimeLog),
    });

    if (isTaskActive && !alreadySetInterval) {
      setSeconds(Number(calculation));

      mainIntervalLocalValue = setInterval(() => {
        setSeconds((current) => current + 1);
      }, 1000);

      alreadySetInterval = true;
    }

    return () => {
      if (mounted && mainIntervalLocalValue) {
        clearInterval(mainIntervalLocalValue);
        alreadySetInterval = false;
      } else {
        mounted = true;
      }
    };
  }, []);

  return (
    <p>
      {isTaskActive && new Date(seconds * 1000).toISOString().slice(11, 19)}
    </p>
  );
}
