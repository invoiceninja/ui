/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { getEntityState } from '$app/common/helpers';
import { Project } from '$app/common/interfaces/project';
import { Task } from '$app/common/interfaces/task';
import {
  calculateEntityState,
  isTaskRunning,
} from '$app/pages/tasks/common/helpers/calculate-entity-state';
import { parseTimeLog } from '$app/pages/tasks/common/helpers/calculate-time';
import dayjs, { Dayjs } from 'dayjs';

export type BurnUpGranularity = 'day' | 'week' | 'month';

export type BurnUpStatus =
  | 'not_started'
  | 'on_track'
  | 'ahead_of_schedule'
  | 'behind_schedule'
  | 'overdue'
  | 'over_budget'
  | 'completed';

export interface BurnUpPoint {
  date: string;
  completed: number | null;
  target: number | null;
  loggedHours: number | null;
}

export interface BurnUpSummary {
  scopeHours: number;
  loggedHours: number;
  remainingHours: number;
  percentComplete: number;
  targetPercent: number | null;
  activeTaskCount: number;
  invoicedTaskCount: number;
  runningTaskCount: number;
  startDate: string;
  dueDate: string | null;
  projectedCompletion: string | null;
  status: BurnUpStatus;
}

export interface BurnUpData {
  series: BurnUpPoint[];
  summary: BurnUpSummary;
  granularity: BurnUpGranularity;
  hasTasks: boolean;
  hasScope: boolean;
  todayKey: string | null;
  dueDateKey: string | null;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function isActive(task: Task) {
  return getEntityState(task) === 'active';
}

function collectLoggedSecondsByDay(tasks: Task[], now: Dayjs) {
  const secondsByDay = new Map<string, number>();
  const nowUnix = now.unix();

  let totalSeconds = 0;

  const add = (dayKey: string, seconds: number) => {
    if (seconds <= 0) {
      return;
    }

    secondsByDay.set(dayKey, (secondsByDay.get(dayKey) ?? 0) + seconds);
    totalSeconds += seconds;
  };

  tasks.forEach((task) => {
    parseTimeLog(task.time_log).forEach(([start, stop]) => {
      if (typeof start !== 'number' || start <= 0) {
        return;
      }

      const running = stop === 0;
      const finish = running ? nowUnix : stop;

      if (typeof finish !== 'number' || finish <= start) {
        return;
      }

      add(dayjs.unix(finish).format('YYYY-MM-DD'), finish - start);
    });
  });

  const cumulative = [...secondsByDay.entries()]
    .map(([key, seconds]) => ({ timestamp: dayjs(key).valueOf(), seconds }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return { cumulative, totalSeconds };
}

function resolveGranularity(spanInDays: number): BurnUpGranularity {
  if (spanInDays <= 45) {
    return 'day';
  }

  if (spanInDays <= 182) {
    return 'week';
  }

  return 'month';
}

function buildBoundaries(
  start: Dayjs,
  end: Dayjs,
  granularity: BurnUpGranularity
) {
  const boundaries: Dayjs[] = [];

  let cursor = start.clone();
  let guard = 0;

  while (!cursor.isAfter(end, 'day') && guard < 1000) {
    boundaries.push(cursor.clone());
    cursor = cursor.add(1, granularity);
    guard += 1;
  }

  if (!boundaries.length) {
    boundaries.push(start.clone());
  }

  if (boundaries[boundaries.length - 1].isBefore(end, 'day')) {
    boundaries.push(end.clone());
  }

  return boundaries;
}

interface ComputeBurnUpOptions {
  now?: Dayjs;
}

export function computeBurnUp(
  project: Project,
  options?: ComputeBurnUpOptions
): BurnUpData {
  const now = (options?.now ?? dayjs()).startOf('day');

  const activeTasks = (project.tasks ?? []).filter(isActive);

  const scopeHours =
    typeof project.budgeted_hours === 'number' && project.budgeted_hours > 0
      ? project.budgeted_hours
      : 0;

  const { cumulative, totalSeconds } = collectLoggedSecondsByDay(
    activeTasks,
    now
  );
  const loggedHours = totalSeconds / 3600;

  const start = (
    project.created_at > 0 ? dayjs.unix(project.created_at) : now
  ).startOf('day');

  const due =
    project.due_date && dayjs(project.due_date).isValid()
      ? dayjs(project.due_date).startOf('day')
      : null;

  const timelineEnd = due ?? now;
  let end = timelineEnd.isBefore(now, 'day') ? now : timelineEnd;

  const timelineStart = start.isAfter(end, 'day') ? end : start;

  if (timelineStart.isSame(end, 'day')) {
    end = timelineStart.add(1, 'day');
  }

  const spanInDays = end.diff(timelineStart, 'day');
  const granularity = resolveGranularity(spanInDays);
  const boundaries = buildBoundaries(timelineStart, end, granularity);

  const dueSpanMs = due ? due.diff(timelineStart) : 0;

  const cumulativeSecondsUntil = (moment: Dayjs) => {
    const limit = moment.valueOf();

    return cumulative.reduce(
      (total, entry) =>
        entry.timestamp <= limit ? total + entry.seconds : total,
      0
    );
  };

  const targetAt = (moment: Dayjs) => {
    if (!due) {
      return null;
    }

    if (dueSpanMs <= 0) {
      return moment.isBefore(due, 'day') ? 0 : 100;
    }

    return clamp((moment.diff(timelineStart) / dueSpanMs) * 100, 0, 100);
  };

  let todayKey: string | null = null;
  let dueDateKey: string | null = null;

  const series: BurnUpPoint[] = boundaries.map((periodStart, index) => {
    const nextBoundary = boundaries[index + 1];
    const periodEnd = nextBoundary ? nextBoundary.subtract(1, 'day') : end;
    const safePeriodEnd = periodEnd.isBefore(periodStart, 'day')
      ? periodStart
      : periodEnd;

    const dateKey = periodStart.format('YYYY-MM-DD');

    const containsToday =
      !now.isBefore(periodStart, 'day') && !now.isAfter(safePeriodEnd, 'day');
    if (containsToday) {
      todayKey = dateKey;
    }

    if (due) {
      const containsDue =
        !due.isBefore(periodStart, 'day') && !due.isAfter(safePeriodEnd, 'day');
      if (containsDue) {
        dueDateKey = dateKey;
      }
    }

    const isFuture = periodStart.isAfter(now, 'day');

    let completed: number | null = null;
    let cumulativeHours: number | null = null;

    if (!isFuture && scopeHours > 0) {
      const asOf = safePeriodEnd.isAfter(now, 'day') ? now : safePeriodEnd;
      cumulativeHours = cumulativeSecondsUntil(asOf) / 3600;
      completed = (cumulativeHours / scopeHours) * 100;
    }

    return {
      date: dateKey,
      completed,
      target: targetAt(periodStart),
      loggedHours: cumulativeHours,
    };
  });

  const percentComplete = scopeHours > 0 ? (loggedHours / scopeHours) * 100 : 0;
  const remainingHours = Math.max(scopeHours - loggedHours, 0);
  const targetPercent = targetAt(now);

  const invoicedTaskCount = activeTasks.filter(
    (task) => calculateEntityState(task) === 'invoiced'
  ).length;
  const runningTaskCount = activeTasks.filter(isTaskRunning).length;

  const projectedCompletion = resolveProjectedCompletion({
    now,
    start: timelineStart,
    loggedHours,
    remainingHours,
    hasScope: scopeHours > 0,
  });

  const status = resolveStatus({
    hasScope: scopeHours > 0,
    loggedHours,
    percentComplete,
    targetPercent,
    isOverdue: Boolean(due && now.isAfter(due, 'day')),
  });

  return {
    series,
    granularity,
    hasTasks: activeTasks.length > 0,
    hasScope: scopeHours > 0,
    todayKey,
    dueDateKey,
    summary: {
      scopeHours,
      loggedHours,
      remainingHours,
      percentComplete,
      targetPercent,
      activeTaskCount: activeTasks.length,
      invoicedTaskCount,
      runningTaskCount,
      startDate: timelineStart.format('YYYY-MM-DD'),
      dueDate: due ? due.format('YYYY-MM-DD') : null,
      projectedCompletion,
      status,
    },
  };
}

function resolveProjectedCompletion(params: {
  now: Dayjs;
  start: Dayjs;
  loggedHours: number;
  remainingHours: number;
  hasScope: boolean;
}): string | null {
  const { now, start, loggedHours, remainingHours, hasScope } = params;

  if (!hasScope || loggedHours <= 0 || remainingHours <= 0) {
    return null;
  }

  const elapsedDays = Math.max(now.diff(start, 'day'), 1);
  const velocityPerDay = loggedHours / elapsedDays;

  if (velocityPerDay <= 0) {
    return null;
  }

  const remainingDays = Math.min(
    Math.ceil(remainingHours / velocityPerDay),
    3650
  );

  return now.add(remainingDays, 'day').format('YYYY-MM-DD');
}

function resolveStatus(params: {
  hasScope: boolean;
  loggedHours: number;
  percentComplete: number;
  targetPercent: number | null;
  isOverdue: boolean;
}): BurnUpStatus {
  const { hasScope, loggedHours, percentComplete, targetPercent, isOverdue } =
    params;

  if (!hasScope || loggedHours <= 0) {
    return 'not_started';
  }

  if (percentComplete > 100) {
    return 'over_budget';
  }

  if (percentComplete >= 100) {
    return 'completed';
  }

  if (isOverdue) {
    return 'overdue';
  }

  if (targetPercent !== null) {
    if (percentComplete >= targetPercent + 5) {
      return 'ahead_of_schedule';
    }

    if (percentComplete <= targetPercent - 5) {
      return 'behind_schedule';
    }
  }

  return 'on_track';
}
