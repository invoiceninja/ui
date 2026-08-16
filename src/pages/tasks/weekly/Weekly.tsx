/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { Task } from '$app/common/interfaces/task';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTasksQuery } from '$app/common/queries/tasks';
import { Button } from '$app/components/forms';
import { ChevronLeft } from '$app/components/icons/ChevronLeft';
import { ChevronRight } from '$app/components/icons/ChevronRight';
import { Plus } from '$app/components/icons/Plus';
import { Default } from '$app/components/layouts/Default';
import {
  parseTimeLog,
  TimeLogType,
} from '$app/pages/tasks/common/helpers/calculate-time';
import { QuickLogTimeModal } from '../common/components/QuickLogTimeModal';
import { TaskHeaderControls } from '../common/components/TaskHeaderControls';
import { useTaskUserFilters } from '../common/components/TaskUserFilters';
import { parseDurationToSeconds } from '../common/helpers';
import { isTaskRunning } from '../common/helpers/calculate-entity-state';
import {
  taskPrimaryLabel,
  taskSecondaryLabel,
} from '../common/helpers/task-label';
import { useTaskDateDisplay } from '../common/hooks/useTaskDateDisplay';
import { CellEdit, WeeklyCell } from './components/WeeklyCell';

const FLUSH_DELAY_MS = 1800;

type PendingMap = Record<string, Record<string, CellEdit>>;

const formatHours = (seconds: number) => {
  if (!seconds) return '';
  const hours = seconds / 3600;
  return hours.toFixed(2).replace(/\.00$/, '');
};

const getWeekStart = (date: string) =>
  dayjs(date, 'YYYY-MM-DD').startOf('week');

// Decoration is centralised in taskCalendarLabel (description + bracketed
// project, falling back to client). The weekly row keeps a one-line layout
// — no secondary line — to stay legible at narrow column widths.

const sumSecondsForDay = (logs: TimeLogType[], day: dayjs.Dayjs) => {
  const dayStart = day.startOf('day').unix();
  const dayEnd = day.endOf('day').unix();
  let total = 0;
  logs.forEach(([s, e]) => {
    if (!s || s < dayStart || s > dayEnd) return;
    const finish = e || dayjs().unix();
    total += Math.max(finish - s, 0);
  });
  return total;
};

// Return the first logged entry on `day`, or null. Used to seed the popover
// fields (description, billable) when the user opens a cell.
const findDayEntry = (
  logs: TimeLogType[],
  day: dayjs.Dayjs
): TimeLogType | null => {
  const dayStart = day.startOf('day').unix();
  const dayEnd = day.endOf('day').unix();
  return (
    logs.find(([s]) => s !== undefined && s >= dayStart && s <= dayEnd) || null
  );
};

// Collapse any existing entries on `day` and replace with a single entry that
// merges the cell's edits over what was already there.
const applyCellEditToLogs = (
  logs: TimeLogType[],
  dayKey: string,
  edit: CellEdit
): TimeLogType[] | { error: 'invalid_duration' } => {
  const day = dayjs(dayKey, 'YYYY-MM-DD');
  const dayStart = day.startOf('day').unix();
  const dayEnd = day.endOf('day').unix();

  const existing = findDayEntry(logs, day);

  const remaining = logs.filter(([s]) => !(s && s >= dayStart && s <= dayEnd));

  let seconds: number;
  if (edit.duration !== undefined) {
    const parsed = parseDurationToSeconds(edit.duration);
    if (parsed === null) return { error: 'invalid_duration' };
    seconds = parsed;
  } else if (existing) {
    const finish = existing[1] || dayjs().unix();
    seconds = Math.max(finish - existing[0], 0);
  } else {
    seconds = 0;
  }

  const description =
    edit.description !== undefined ? edit.description : (existing?.[2] ?? '');

  const billable =
    edit.billable !== undefined ? edit.billable : (existing?.[3] ?? true);

  if (seconds <= 0 && !description) {
    return remaining;
  }

  const newStart =
    existing && existing[0]
      ? existing[0]
      : day.startOf('day').add(9, 'hour').unix();

  remaining.push([newStart, newStart + seconds, description, billable]);
  return remaining;
};

export default function Weekly() {
  const { documentTitle } = useTitle('freq_weekly');
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const { displayDate, displayDateRange, displayWeekday } =
    useTaskDateDisplay();

  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const today = dayjs().format('YYYY-MM-DD');
  const referenceDate = dateParam || today;
  const weekStart = getWeekStart(referenceDate);

  const [quickLogVisible, setQuickLogVisible] = useState(false);

  const [pending, setPending] = useState<PendingMap>({});
  const pendingRef = useRef<PendingMap>({});

  const [optimisticLogs, setOptimisticLogs] = useState<
    Record<string, TimeLogType[]>
  >({});
  const optimisticLogsRef = useRef<Record<string, TimeLogType[]>>({});

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day')),
    [weekStart]
  );

  const userFilters = useTaskUserFilters();

  const windowStart = weekStart.format('YYYY-MM-DD');
  const windowEnd = weekStart.add(6, 'day').format('YYYY-MM-DD');
  const dateRangeParam = `&date_range=calculated_start_date,${windowStart},${windowEnd}`;

  const { data, isLoading } = useTasksQuery({
    endpoint: `/api/v1/tasks?per_page=500&sort=date|asc&include=client,project&status=active&without_deleted_clients=true${userFilters.queryString}${dateRangeParam}`,
  });

  const allTasks: Task[] = useMemo(() => data?.data ?? [], [data]);

  const flushing = useRef<Set<string>>(new Set());
  const flushTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Sync optimistic logs from server state. Only adopts server data when
  // a task has no in-flight or pending edits.
  useEffect(() => {
    let changed = false;
    const nextAll: Record<string, TimeLogType[]> = { ...optimisticLogs };

    allTasks.forEach((task) => {
      if (flushing.current.has(task.id)) return;
      if (pendingRef.current[task.id]) return;

      const next = parseTimeLog(task.time_log) as TimeLogType[];
      const prev = optimisticLogsRef.current[task.id];

      if (!prev || JSON.stringify(prev) !== JSON.stringify(next)) {
        nextAll[task.id] = next;
        optimisticLogsRef.current[task.id] = next;
        changed = true;
      }
    });

    if (changed) {
      setOptimisticLogs(nextAll);
    }
  }, [allTasks]);

  const getLogsForTask = (taskId: string, fallbackLog: string) =>
    optimisticLogs[taskId] ?? (parseTimeLog(fallbackLog) as TimeLogType[]);

  const weekDayKeys = useMemo(
    () => days.map((d) => d.format('YYYY-MM-DD')),
    [days]
  );

  // Ordering is driven by the server-side `sort=date|asc` on the query
  // above; we only filter to rows that have any activity (real or pending)
  // inside the visible week. Order from the API is preserved as-is.
  const rows = useMemo(() => {
    return allTasks.filter((task) => {
      const taskDateInWeek = task.date && weekDayKeys.includes(task.date);
      const hasPendingInWeek = Object.keys(pending[task.id] ?? {}).some(
        (dayKey) => weekDayKeys.includes(dayKey)
      );
      return taskDateInWeek || hasPendingInWeek;
    });
  }, [allTasks, weekDayKeys, pending]);

  const setDate = (next: string) => {
    const updated = new URLSearchParams(searchParams);
    if (next) updated.set('date', next);
    else updated.delete('date');
    setSearchParams(updated);
  };
  const prevWeek = () =>
    setDate(weekStart.subtract(7, 'day').format('YYYY-MM-DD'));
  const nextWeek = () => setDate(weekStart.add(7, 'day').format('YYYY-MM-DD'));
  const goToday = () => setDate(today);

  const flushTask = async (taskId: string) => {
    if (flushing.current.has(taskId)) {
      flushTimers.current[taskId] = setTimeout(
        () => flushTask(taskId),
        FLUSH_DELAY_MS
      );
      return;
    }

    const snapshot: Record<string, CellEdit> = {
      ...(pendingRef.current[taskId] ?? {}),
    };
    const dayKeys = Object.keys(snapshot);
    if (dayKeys.length === 0) return;

    const task = allTasks.find((entry) => entry.id === taskId);
    if (!task) return;

    if (isTaskRunning(task)) {
      toast.error('stop_task_to_add_task_entry');
      return;
    }

    let logs =
      optimisticLogsRef.current[taskId] ??
      (parseTimeLog(task.time_log) as TimeLogType[]);
    let invalid = false;

    for (const dayKey of dayKeys) {
      const next = applyCellEditToLogs(logs, dayKey, snapshot[dayKey]);
      if ('error' in next) {
        invalid = true;
        break;
      }
      logs = next;
    }

    if (invalid) {
      toast.error('please_enter_a_valid_duration');
      return;
    }

    optimisticLogsRef.current[taskId] = logs;
    setOptimisticLogs((prev) => ({ ...prev, [taskId]: logs }));

    // Drop snapshotted cells from pending. Newer edits that arrived during
    // this snapshot stay for the next flush.
    const nextPendingForTask = { ...(pendingRef.current[taskId] ?? {}) };
    for (const dayKey of dayKeys) {
      if (
        nextPendingForTask[dayKey] &&
        JSON.stringify(nextPendingForTask[dayKey]) ===
          JSON.stringify(snapshot[dayKey])
      ) {
        delete nextPendingForTask[dayKey];
      }
    }
    const nextPending = { ...pendingRef.current };
    if (Object.keys(nextPendingForTask).length === 0) {
      delete nextPending[taskId];
    } else {
      nextPending[taskId] = nextPendingForTask;
    }
    pendingRef.current = nextPending;
    setPending(nextPending);

    flushing.current.add(taskId);
    toast.processing();

    try {
      await request('PUT', endpoint('/api/v1/tasks/:id', { id: taskId }), {
        ...task,
        time_log: JSON.stringify(logs),
        is_date_based: true,
      });
      toast.success('updated_task');
      $refetch(['tasks']);
    } catch (raw) {
      const error = raw as AxiosError<ValidationBag>;
      const status = error?.response?.status;
      const data = error?.response?.data;

      const rolledBack = parseTimeLog(task.time_log) as TimeLogType[];
      optimisticLogsRef.current[taskId] = rolledBack;
      setOptimisticLogs((prev) => ({ ...prev, [taskId]: rolledBack }));

      // Drop the snapshotted edits we just sent so they don't re-flush on
      // an infinite loop. Anything typed after the snapshot stays.
      const stillPendingForTask = {
        ...(pendingRef.current[taskId] ?? {}),
      };
      for (const dayKey of dayKeys) {
        if (
          stillPendingForTask[dayKey] &&
          JSON.stringify(stillPendingForTask[dayKey]) ===
            JSON.stringify(snapshot[dayKey])
        ) {
          delete stillPendingForTask[dayKey];
        }
      }
      const nextPendingAfterFail = { ...pendingRef.current };
      if (Object.keys(stillPendingForTask).length === 0) {
        delete nextPendingAfterFail[taskId];
      } else {
        nextPendingAfterFail[taskId] = stillPendingForTask;
      }
      pendingRef.current = nextPendingAfterFail;
      setPending(nextPendingAfterFail);

      if (status === 422 && data) {
        // Do NOT dismiss first: the toast singleton reuses one id for
        // processing → error. Dismissing kills the id and a subsequent
        // toast.error against that same id is dropped by react-hot-toast.
        const messages = Object.values(data.errors ?? {}).flat();
        const combined =
          messages.length > 0 ? messages.join('\n') : data.message;
        toast.error(combined || 'error_title');
      } else {
        toast.error();
      }
    } finally {
      flushing.current.delete(taskId);
      if (
        pendingRef.current[taskId] &&
        Object.keys(pendingRef.current[taskId]).length > 0
      ) {
        scheduleFlush(taskId);
      }
    }
  };

  const scheduleFlush = (taskId: string) => {
    if (flushTimers.current[taskId]) {
      clearTimeout(flushTimers.current[taskId]);
    }
    flushTimers.current[taskId] = setTimeout(
      () => flushTask(taskId),
      FLUSH_DELAY_MS
    );
  };

  // Merge partial edit into pending and (re-)arm the debounce timer.
  const mergeCellEdit = (taskId: string, dayKey: string, partial: CellEdit) => {
    const nextForTask = {
      ...(pendingRef.current[taskId] ?? {}),
      [dayKey]: {
        ...(pendingRef.current[taskId]?.[dayKey] ?? {}),
        ...partial,
      },
    };
    const next: PendingMap = { ...pendingRef.current, [taskId]: nextForTask };
    pendingRef.current = next;
    setPending(next);
    scheduleFlush(taskId);
  };

  useEffect(() => {
    const timers = flushTimers.current;
    return () => {
      Object.values(timers).forEach((id) => clearTimeout(id));
      // Best-effort flush of anything still pending on unmount.
      Object.keys(pendingRef.current).forEach((taskId) => {
        flushTask(taskId);
      });
    };
  }, []);

  const cellDurationDisplay = (
    taskId: string,
    fallbackLog: string,
    day: dayjs.Dayjs
  ) => {
    const dayKey = day.format('YYYY-MM-DD');
    const pendingDuration = pending[taskId]?.[dayKey]?.duration;
    if (pendingDuration !== undefined) return pendingDuration;
    return formatHours(
      sumSecondsForDay(getLogsForTask(taskId, fallbackLog), day)
    );
  };

  const cellSeconds = (
    taskId: string,
    fallbackLog: string,
    day: dayjs.Dayjs
  ) => {
    const dayKey = day.format('YYYY-MM-DD');
    const pendingDuration = pending[taskId]?.[dayKey]?.duration;
    if (pendingDuration !== undefined) {
      const parsed = parseDurationToSeconds(pendingDuration);
      return parsed ?? 0;
    }
    return sumSecondsForDay(getLogsForTask(taskId, fallbackLog), day);
  };

  const weekTotalSeconds = (task: Task) =>
    days.reduce((sum, d) => sum + cellSeconds(task.id, task.time_log, d), 0);

  const dayTotalSeconds = (day: dayjs.Dayjs) =>
    rows.reduce(
      (sum, task) => sum + cellSeconds(task.id, task.time_log, day),
      0
    );

  const grandTotalSeconds = rows.reduce(
    (sum, task) => sum + weekTotalSeconds(task),
    0
  );

  return (
    <Default
      title={documentTitle}
      breadcrumbs={[
        { name: t('tasks'), href: '/tasks' },
        { name: t('freq_weekly'), href: '/tasks/weekly' },
      ]}
      topRight={<TaskHeaderControls />}
    >
      <QuickLogTimeModal
        visible={quickLogVisible}
        setVisible={setQuickLogVisible}
        defaults={{ date: referenceDate }}
      />

      <div className="px-4 md:px-6 pt-4 pb-8">
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-md border"
          style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevWeek}
              className="p-2 rounded-md border"
              style={{ borderColor: colors.$5 }}
              aria-label="prev week"
            >
              <ChevronLeft size="1rem" color={colors.$3} />
            </button>

            <div className="px-3 text-center">
              <div className="font-medium" style={{ color: colors.$3 }}>
                {displayDateRange(weekStart, weekStart.add(6, 'day'))}
              </div>
              <div className="text-xs" style={{ color: colors.$17 }}>
                {(grandTotalSeconds / 3600).toFixed(2)} {t('hours')}
              </div>
            </div>

            <button
              type="button"
              onClick={nextWeek}
              className="p-2 rounded-md border"
              style={{ borderColor: colors.$5 }}
              aria-label="next week"
            >
              <ChevronRight size="1rem" color={colors.$3} />
            </button>

            <Button type="secondary" onClick={goToday}>
              {t('today')}
            </Button>
          </div>

          <Button onClick={() => setQuickLogVisible(true)}>
            <span className="inline-flex items-center gap-1">
              <Plus size="0.9rem" color="#fff" />
              {t('log_time')}
            </span>
          </Button>
        </div>

        <div
          className="mt-4 rounded-md border overflow-x-auto"
          style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: colors.$17 }}>
                <th className="text-left p-3 min-w-[16rem]">{t('task')}</th>
                {days.map((d) => (
                  <th
                    key={d.format('YYYY-MM-DD')}
                    className="text-center p-3 min-w-[5rem]"
                  >
                    <div>{displayWeekday(d)}</div>
                    <div className="text-xs font-normal">{displayDate(d)}</div>
                  </th>
                ))}
                <th className="text-center p-3 min-w-[5rem]">{t('total')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-6 text-center text-sm"
                    style={{ color: colors.$17 }}
                  >
                    {t('loading')}
                  </td>
                </tr>
              )}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-10 text-center"
                    style={{ color: colors.$17 }}
                  >
                    {t('no_records_found')}
                  </td>
                </tr>
              )}

              {!isLoading &&
                rows.map((task) => {
                  const logs = getLogsForTask(task.id, task.time_log);
                  const taskIsRunning = isTaskRunning(task);
                  return (
                    <tr
                      key={task.id}
                      className="border-t"
                      style={{ borderColor: colors.$5 }}
                    >
                      <td className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0">
                            <button
                              type="button"
                              className="text-left hover:underline block truncate max-w-[18rem]"
                              onClick={() => navigate(`/tasks/${task.id}/edit`)}
                              style={{ color: colors.$3 }}
                              title={taskPrimaryLabel(task, 200)}
                            >
                              {taskPrimaryLabel(task)}
                            </button>
                            {taskSecondaryLabel(task) && (
                              <div
                                className="text-xs truncate max-w-[18rem]"
                                style={{ color: colors.$17 }}
                              >
                                {taskSecondaryLabel(task)}
                              </div>
                            )}
                          </div>
                          {taskIsRunning && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                              }}
                              title="Stop the running timer to edit this row"
                            >
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ backgroundColor: '#dc2626' }}
                              />
                              {t('running')}
                            </span>
                          )}
                        </div>
                      </td>
                      {days.map((d) => {
                        const dayKey = d.format('YYYY-MM-DD');
                        const pendingEdit = pending[task.id]?.[dayKey];
                        const existingEntry = findDayEntry(logs, d);
                        return (
                          <td key={dayKey} className="p-1 text-center">
                            <WeeklyCell
                              taskId={task.id}
                              dayKey={dayKey}
                              durationText={cellDurationDisplay(
                                task.id,
                                task.time_log,
                                d
                              )}
                              isPending={
                                Boolean(pendingEdit) ||
                                flushing.current.has(task.id)
                              }
                              disabled={taskIsRunning}
                              initialBillable={
                                pendingEdit?.billable ??
                                existingEntry?.[3] ??
                                true
                              }
                              initialDescription={
                                pendingEdit?.description ??
                                existingEntry?.[2] ??
                                ''
                              }
                              onEdit={(partial) =>
                                mergeCellEdit(task.id, dayKey, partial)
                              }
                            />
                          </td>
                        );
                      })}
                      <td
                        className="p-3 text-center font-mono"
                        style={{ color: colors.$3 }}
                      >
                        {(weekTotalSeconds(task) / 3600).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

              {!isLoading && rows.length > 0 && (
                <tr
                  className="border-t font-medium"
                  style={{ borderColor: colors.$5, color: colors.$3 }}
                >
                  <td className="p-3 text-right">{t('total')}</td>
                  {days.map((d) => (
                    <td
                      key={d.format('YYYY-MM-DD')}
                      className="p-3 text-center font-mono"
                    >
                      {(dayTotalSeconds(d) / 3600).toFixed(2)}
                    </td>
                  ))}
                  <td className="p-3 text-center font-mono">
                    {(grandTotalSeconds / 3600).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Default>
  );
}
