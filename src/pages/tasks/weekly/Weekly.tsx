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
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { preventLeavingPageAtom } from '$app/common/hooks/useAddPreventNavigationEvents';
import {
  usePreventNavigation,
  isNavigationModalVisibleAtom,
  navigationDiscardActionsAtom,
} from '$app/common/hooks/usePreventNavigation';
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
  formatTimeLogDayHours,
  parseTimeLog,
  TimeLogType,
  timeLogSegmentSecondsOnDayKey,
} from '$app/pages/tasks/common/helpers/calculate-time';
import { QuickLogTimeModal } from '../common/components/QuickLogTimeModal';
import { TaskHeaderControls } from '../common/components/TaskHeaderControls';
import { useTaskUserFilters } from '../common/components/TaskUserFilters';
import { parseDurationToSeconds } from '../common/helpers';
import {
  taskActivityDatesQueryParam,
  taskHasActivityInDayKeys,
} from '../common/helpers/activity-dates';
import { isTaskRunning } from '../common/helpers/calculate-entity-state';
import {
  taskPrimaryLabel,
  taskSecondaryLabel,
} from '../common/helpers/task-label';
import { useTaskDateDisplay } from '../common/hooks/useTaskDateDisplay';
import { weeklyCellReadOnlyReason } from './cell-editability';
import { CellEdit, WeeklyCell } from './components/WeeklyCell';

const FLUSH_DELAY_MS = 1800;

type PendingMap = Record<string, Record<string, CellEdit>>;

const formatHours = formatTimeLogDayHours;

const getWeekStart = (date: string) =>
  dayjs(date, 'YYYY-MM-DD').startOf('week');

// Decoration is centralised in taskCalendarLabel (description + bracketed
// project, falling back to client). The weekly row keeps a one-line layout
// — no secondary line — to stay legible at narrow column widths.

const sumSecondsForDay = (logs: TimeLogType[], day: dayjs.Dayjs) => {
  const dayKey = day.format('YYYY-MM-DD');
  let total = 0;
  logs.forEach(([s, e]) => {
    total += timeLogSegmentSecondsOnDayKey(s, e, dayKey);
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
  const preventNavigation = usePreventNavigation();
  const setPreventLeaving = useSetAtom(preventLeavingPageAtom);
  const setNavigationDiscardActions = useSetAtom(navigationDiscardActionsAtom);
  const navigationModalVisible = useAtomValue(isNavigationModalVisibleAtom);
  const navigationModalRef = useRef(navigationModalVisible);
  navigationModalRef.current = navigationModalVisible;
  const [savingCount, setSavingCount] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
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
  const activityDatesParam = taskActivityDatesQueryParam(
    windowStart,
    windowEnd
  );

  const { data, isLoading } = useTasksQuery({
    endpoint: `/api/v1/tasks?per_page=500&sort=date|asc&include=client,project&status=active&without_deleted_clients=true${userFilters.queryString}${activityDatesParam}`,
  });

  const allTasks: Task[] = useMemo(() => data?.data ?? [], [data]);

  const tasksRef = useRef(allTasks);
  tasksRef.current = allTasks;
  const flushing = useRef<Set<string>>(new Set());
  const savesRef = useRef(new Map<string, Promise<boolean>>());
  const flushRef = useRef<(id: string) => Promise<boolean>>(async () => false);
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
  const weekDayKeySet = useMemo(() => new Set(weekDayKeys), [weekDayKeys]);

  const rows = useMemo(() => {
    return allTasks.filter((task) => {
      const hasPendingInWeek = Object.keys(pending[task.id] ?? {}).some(
        (dayKey) => weekDayKeys.includes(dayKey)
      );
      return taskHasActivityInDayKeys(task, weekDayKeySet) || hasPendingInWeek;
    });
  }, [allTasks, weekDayKeys, weekDayKeySet, pending]);

  const setDate = (next: string) => {
    const updated = new URLSearchParams(searchParams);
    if (next) updated.set('date', next);
    else updated.delete('date');
    preventNavigation({ fn: () => setSearchParams(updated) });
  };
  const prevWeek = () =>
    setDate(weekStart.subtract(7, 'day').format('YYYY-MM-DD'));
  const nextWeek = () => setDate(weekStart.add(7, 'day').format('YYYY-MM-DD'));
  const goToday = () => setDate(today);

  const clearFlushTimers = () => {
    Object.values(flushTimers.current).forEach(clearTimeout);
    flushTimers.current = {};
  };

  const flushTask = (taskId: string): Promise<boolean> => {
    const active = savesRef.current.get(taskId);
    if (active) return active;
    clearTimeout(flushTimers.current[taskId]);
    const snapshot = { ...(pendingRef.current[taskId] ?? {}) };
    const dayKeys = Object.keys(snapshot);
    if (!dayKeys.length) return Promise.resolve(true);
    const task = tasksRef.current.find((entry) => entry.id === taskId);
    if (!task) return Promise.resolve(false);
    let logs =
      optimisticLogsRef.current[taskId] ??
      (parseTimeLog(task.time_log) as TimeLogType[]);
    for (const dayKey of dayKeys) {
      const reason = weeklyCellReadOnlyReason(task, logs, dayKey);
      const next = reason
        ? null
        : applyCellEditToLogs(logs, dayKey, snapshot[dayKey]);
      if (!next || 'error' in next) {
        toast.error(reason || 'please_enter_a_valid_duration');
        setSaveFailed(true);
        return Promise.resolve(false);
      }
      logs = next;
    }

    flushing.current.add(taskId);
    setSavingCount(flushing.current.size);
    const save = (async () => {
      let succeeded = false;
      try {
        await request(
          'PUT',
          endpoint('/api/v1/tasks/:id', { id: taskId }),
          {
            ...task,
            time_log: JSON.stringify(logs),
            is_date_based: true,
          },
          { skipIntercept: true }
        );
        optimisticLogsRef.current[taskId] = logs;
        setOptimisticLogs((prev) => ({ ...prev, [taskId]: logs }));
        // Keep edits made during the request, and only remove saved snapshots.
        const remaining = { ...(pendingRef.current[taskId] ?? {}) };
        dayKeys.forEach((key) => {
          if (JSON.stringify(remaining[key]) === JSON.stringify(snapshot[key]))
            delete remaining[key];
        });
        const next = { ...pendingRef.current };
        if (Object.keys(remaining).length) next[taskId] = remaining;
        else delete next[taskId];
        pendingRef.current = next;
        setPending(next);
        succeeded = true;
        setSaveFailed(false);
        toast.success('updated_task');
        $refetch(['tasks']);
        return true;
      } catch (raw) {
        // Retain the edits for explicit retry; never silently drop failed work.
        setSaveFailed(true);
        const error = raw as AxiosError<ValidationBag>;
        const data = error.response?.data;
        const message = Object.values(data?.errors ?? {})
          .flat()
          .join('\n');
        toast.error(message || 'weekly_save_failed');
        return false;
      } finally {
        savesRef.current.delete(taskId);
        flushing.current.delete(taskId);
        setSavingCount(flushing.current.size);
        if (succeeded && pendingRef.current[taskId]) scheduleFlush(taskId);
      }
    })();
    savesRef.current.set(taskId, save);
    return save;
  };
  flushRef.current = flushTask;

  const scheduleFlush = (taskId: string) => {
    clearTimeout(flushTimers.current[taskId]);
    if (navigationModalRef.current) return;
    flushTimers.current[taskId] = setTimeout(() => {
      if (!navigationModalRef.current) void flushRef.current(taskId);
    }, FLUSH_DELAY_MS);
  };

  const saveAll = async () => {
    clearFlushTimers();
    if ((await Promise.all([...savesRef.current.values()])).includes(false))
      return false;
    for (const id of Object.keys(pendingRef.current)) {
      if (!(await flushRef.current(id))) return false;
    }
    return Object.keys(pendingRef.current).length === 0;
  };

  const actionsRef = useRef({ discard: () => {} });
  actionsRef.current = {
    discard: () => {
      clearFlushTimers();
      pendingRef.current = {};
      setPending({});
      setSaveFailed(false);
    },
  };
  useEffect(() => {
    setNavigationDiscardActions({
      discard: () => actionsRef.current.discard(),
      busy: savingCount > 0,
    });
  }, [savingCount]);

  const hasUnsavedChanges = Object.keys(pending).length > 0 || savingCount > 0;
  useEffect(() => {
    setPreventLeaving((current) => ({
      ...current,
      prevent: hasUnsavedChanges,
    }));
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (navigationModalVisible) clearFlushTimers();
    else if (!saveFailed)
      Object.keys(pendingRef.current).forEach(scheduleFlush);
  }, [navigationModalVisible]);

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

  useEffect(
    () => () => {
      clearFlushTimers();
      setPreventLeaving({ prevent: false });
      setNavigationDiscardActions(null);
    },
    []
  );

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
      {saveFailed && (
        <div role="alert" className="px-6 py-3">
          {t('weekly_save_failed')}
          <Button type="secondary" onClick={saveAll} disabled={savingCount > 0}>
            {t('weekly_retry')}
          </Button>
        </div>
      )}
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
                              onClick={() =>
                                preventNavigation({
                                  url: `/tasks/${task.id}/edit`,
                                })
                              }
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
                        const readOnlyReason = weeklyCellReadOnlyReason(
                          task,
                          logs,
                          dayKey
                        );
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
                              disabled={Boolean(readOnlyReason)}
                              readOnlyReason={
                                readOnlyReason ? t(readOnlyReason) : undefined
                              }
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
