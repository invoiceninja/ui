/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { Task } from '$app/common/interfaces/task';
import {
  parseTimeLog,
  timeLogBillableSecondsOnDayKey,
  timeLogSecondsOnDayKey,
  timeLogSegmentEndUnix,
  timeLogSegmentOverlapsDayKey,
} from '$app/pages/tasks/common/helpers/calculate-time';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** List tasks with time-log activity between start and end (inclusive). */
export function taskActivityDatesQueryParam(
  start: string,
  end: string
): string {
  return `&activity_dates=${start},${end}`;
}

function addSegmentDayKeys(
  days: Set<string>,
  start: number,
  end: number,
  visibleDayKeys?: ReadonlySet<string>
): void {
  if (!start) return;

  if (visibleDayKeys?.size) {
    visibleDayKeys.forEach((dayKey) => {
      if (timeLogSegmentOverlapsDayKey(start, end, dayKey)) {
        days.add(dayKey);
      }
    });
    return;
  }

  const finish = timeLogSegmentEndUnix(end);
  let cursor = dayjs.unix(start).startOf('day');
  const last = dayjs.unix(finish).startOf('day');

  while (cursor.isBefore(last, 'day') || cursor.isSame(last, 'day')) {
    days.add(cursor.format('YYYY-MM-DD'));
    cursor = cursor.add(1, 'day');
  }
}

/** Calendar days (YYYY-MM-DD) where this task has logged activity. */
export function taskActivityDayKeys(
  task: Task,
  visibleDayKeys?: ReadonlySet<string>
): string[] {
  const days = new Set<string>();
  const logs = parseTimeLog(task.time_log);

  logs.forEach(([start, end]) => {
    addSegmentDayKeys(days, start, end, visibleDayKeys);
  });

  if (
    days.size === 0 &&
    logs.length === 0 &&
    task.date &&
    ISO_DATE.test(task.date)
  ) {
    if (!visibleDayKeys || visibleDayKeys.has(task.date)) {
      days.add(task.date);
    }
  }

  return [...days];
}

export function taskSecondsOnDayKey(task: Task, dayKey: string): number {
  return timeLogSecondsOnDayKey(task.time_log, dayKey);
}

/** Total logged seconds on dayKey across all tasks (each task counted once). */
export function totalTaskSecondsOnDayKey(
  tasks: Task[],
  dayKey: string
): number {
  return tasks.reduce(
    (sum, task) => sum + taskSecondsOnDayKey(task, dayKey),
    0
  );
}

export function taskBillableSecondsOnDayKey(
  task: Task,
  dayKey: string
): number {
  return timeLogBillableSecondsOnDayKey(task.time_log, dayKey);
}

export function totalTaskBillableSecondsOnDayKey(
  tasks: Task[],
  dayKey: string
): number {
  return tasks.reduce(
    (sum, task) => sum + taskBillableSecondsOnDayKey(task, dayKey),
    0
  );
}

export function taskHasActivityInDayKeys(
  task: Task,
  dayKeys: ReadonlySet<string> | readonly string[]
): boolean {
  const visible =
    dayKeys instanceof Set ? dayKeys : new Set(dayKeys as string[]);
  return taskActivityDayKeys(task, visible).length > 0;
}

/** dayKey -> tasks that should appear on that day in the month grid. */
export function buildTasksByDay(
  tasks: Task[],
  visibleDayKeys?: ReadonlySet<string>
): Record<string, Task[]> {
  const out: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    const seenForTask = new Set<string>();

    taskActivityDayKeys(task, visibleDayKeys).forEach((dayKey) => {
      if (seenForTask.has(dayKey)) return;
      seenForTask.add(dayKey);
      (out[dayKey] ||= []).push(task);
    });
  });

  return out;
}
