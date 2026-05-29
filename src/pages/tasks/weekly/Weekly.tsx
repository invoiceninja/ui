/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from '$app/components/layouts/Default';
import { Button, Checkbox } from '$app/components/forms';
import { useTitle } from '$app/common/hooks/useTitle';
import { useTasksQuery } from '$app/common/queries/tasks';
import { Task } from '$app/common/interfaces/task';
import {
  parseTimeLog,
  TimeLogType,
} from '$app/pages/tasks/common/helpers/calculate-time';
import dayjs from 'dayjs';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ChevronLeft } from '$app/components/icons/ChevronLeft';
import { ChevronRight } from '$app/components/icons/ChevronRight';
import { Plus } from '$app/components/icons/Plus';
import { QuickLogTimeModal } from '../common/components/QuickLogTimeModal';
import { TaskHeaderControls } from '../common/components/TaskHeaderControls';
import { useTaskUserFilters } from '../common/components/TaskUserFilters';
import { parseDurationToSeconds } from '../common/helpers';
import { isTaskRunning } from '../common/helpers/calculate-entity-state';
import { Popover, Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';
import { Message } from '$app/components/icons/Message';

const FLUSH_DELAY_MS = 1800;

interface CellEdit {
  duration?: string;
  description?: string;
  billable?: boolean;
}

type PendingMap = Record<string, Record<string, CellEdit>>;

const formatHours = (seconds: number) => {
  if (!seconds) return '';
  const hours = seconds / 3600;
  return hours.toFixed(2).replace(/\.00$/, '');
};

const getWeekStart = (date: string) =>
  dayjs(date, 'YYYY-MM-DD').startOf('week');

// Primary label: description, else project/client name, else task number.
const taskPrimaryLabel = (task: Task): string => {
  if (task.description) return task.description;
  if (task.project?.name) return task.project.name;
  if (task.client?.display_name) return task.client.display_name;
  return `Task #${task.number || task.id.slice(0, 6)}`;
};

// Secondary line: "Client · Project" when both are present, else whichever
// isn't already shown in the primary line. Empty string when nothing useful.
const taskSecondaryLabel = (task: Task): string => {
  const client = task.client?.display_name;
  const project = task.project?.name;

  if (task.description) {
    if (client && project) return `${client} · ${project}`;
    return project || client || '';
  }

  // Primary label was project name → fall back to client.
  if (project) return client || '';
  return '';
};

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

  const remaining = logs.filter(
    ([s]) => !(s && s >= dayStart && s <= dayEnd)
  );

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
    edit.description !== undefined
      ? edit.description
      : existing?.[2] ?? '';

  const billable =
    edit.billable !== undefined
      ? edit.billable
      : existing?.[3] ?? true;

  if (seconds <= 0 && !description) {
    return remaining;
  }

  const newStart =
    existing && existing[0] ? existing[0] : day.startOf('day').add(9, 'hour').unix();

  remaining.push([newStart, newStart + seconds, description, billable]);
  return remaining;
};

export default function Weekly() {
  const { documentTitle } = useTitle('weekly');
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const today = dayjs().format('YYYY-MM-DD');
  const referenceDate = dateParam || today;
  const weekStart = getWeekStart(referenceDate);

  const [quickLogVisible, setQuickLogVisible] = useState(false);

  const [pending, setPending] = useState<PendingMap>({});
  const pendingRef = useRef<PendingMap>({});

  const [, setTick] = useState(0);
  const rerender = () => setTick((n) => n + 1);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day')),
    [weekStart]
  );

  const userFilters = useTaskUserFilters();

  const { data, isLoading } = useTasksQuery({
    endpoint: `/api/v1/tasks?per_page=500&sort=updated_at|desc&include=client,project${userFilters.queryString}`,
  });

  const allTasks: Task[] = useMemo(() => data?.data ?? [], [data]);

  // Optimistic per-task time_log used as the base for the next PUT and for
  // display. Only adopt server state for a task while it has no in-flight
  // or pending edits.
  const optimisticLogsRef = useRef<Record<string, TimeLogType[]>>({});
  const flushing = useRef<Set<string>>(new Set());
  const flushTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let changed = false;
    allTasks.forEach((task) => {
      if (flushing.current.has(task.id)) return;
      if (pendingRef.current[task.id]) return;
      const next = parseTimeLog(task.time_log) as TimeLogType[];
      const prev = optimisticLogsRef.current[task.id];
      if (!prev || JSON.stringify(prev) !== JSON.stringify(next)) {
        optimisticLogsRef.current[task.id] = next;
        changed = true;
      }
    });
    if (changed) rerender();
  }, [allTasks]);

  const getLogsForTask = useCallback(
    (taskId: string, fallbackLog: string) =>
      optimisticLogsRef.current[taskId] ??
      (parseTimeLog(fallbackLog) as TimeLogType[]),
    []
  );

  const weekStartUnix = weekStart.startOf('day').unix();
  const weekEndUnix = weekStart.add(7, 'day').startOf('day').unix();

  const rows = useMemo(() => {
    const filtered = allTasks.filter((task) => {
      const logs = getLogsForTask(task.id, task.time_log);
      const hasEntryInWeek = logs.some(
        ([s]) => s && s >= weekStartUnix && s < weekEndUnix
      );
      const hasPendingInWeek = Object.keys(pending[task.id] ?? {}).some(
        (dayKey) => {
          const d = dayjs(dayKey, 'YYYY-MM-DD').unix();
          return d >= weekStartUnix && d < weekEndUnix;
        }
      );
      return hasEntryInWeek || hasPendingInWeek;
    });
    return filtered.sort((a, b) => {
      const ca = a.created_at || 0;
      const cb = b.created_at || 0;
      if (ca !== cb) return ca - cb;
      return a.id.localeCompare(b.id);
    });
  }, [allTasks, weekStartUnix, weekEndUnix, pending, getLogsForTask]);

  const setDate = (next: string) => {
    const updated = new URLSearchParams(searchParams);
    if (next) updated.set('date', next);
    else updated.delete('date');
    setSearchParams(updated);
  };
  const prevWeek = () =>
    setDate(weekStart.subtract(7, 'day').format('YYYY-MM-DD'));
  const nextWeek = () =>
    setDate(weekStart.add(7, 'day').format('YYYY-MM-DD'));
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

    let logs = getLogsForTask(taskId, task.time_log);
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
    } catch {
      toast.error();
      optimisticLogsRef.current[taskId] = parseTimeLog(
        task.time_log
      ) as TimeLogType[];
    } finally {
      flushing.current.delete(taskId);
      rerender();
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
  const mergeCellEdit = (
    taskId: string,
    dayKey: string,
    partial: CellEdit
  ) => {
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
    return formatHours(sumSecondsForDay(getLogsForTask(taskId, fallbackLog), day));
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
        { name: t('weekly'), href: '/tasks/weekly' },
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
                {weekStart.format('MMM D')} –{' '}
                {weekStart.add(6, 'day').format('MMM D, YYYY')}
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
                    <div>{d.format('ddd')}</div>
                    <div className="text-xs font-normal">{d.format('M/D')}</div>
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
                              title={taskPrimaryLabel(task)}
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

interface WeeklyCellProps {
  taskId: string;
  dayKey: string;
  durationText: string;
  isPending: boolean;
  disabled?: boolean;
  initialBillable: boolean;
  initialDescription: string;
  onEdit: (partial: CellEdit) => void;
}

function WeeklyCell({
  durationText,
  isPending,
  disabled,
  initialBillable,
  initialDescription,
  onEdit,
}: WeeklyCellProps) {
  const colors = useColorScheme();
  const iconBtnRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(
    null
  );

  const reposition = useCallback(() => {
    const rect = iconBtnRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPanelPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.right + window.scrollX,
    });
  }, []);

  useEffect(() => {
    if (!panelPos) return;
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [panelPos, reposition]);

  const hasNote = Boolean(initialDescription) || initialBillable === false;
  const cellRootRef = useRef<HTMLDivElement>(null);

  const moveFocusToAdjacentCell = (direction: 'next' | 'prev') => {
    const all = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[data-weekly-cell]')
    );
    const ownInput = cellRootRef.current?.querySelector<HTMLInputElement>(
      'input[data-weekly-cell]'
    );
    if (!ownInput) return;
    const idx = all.indexOf(ownInput);
    if (idx === -1) return;
    const target = direction === 'next' ? all[idx + 1] : all[idx - 1];
    target?.focus();
    target?.select?.();
  };

  return (
    <div className="relative" ref={cellRootRef}>
      <input
        type="text"
        inputMode="decimal"
        data-weekly-cell="1"
        value={durationText}
        readOnly={disabled}
        title={disabled ? 'Stop the running timer to edit' : undefined}
        onChange={(event) => {
          if (disabled) return;
          onEdit({ duration: event.target.value });
        }}
        placeholder="0"
        className="w-full text-center py-2 pl-2 pr-7 rounded-md text-sm border focus:outline-none focus:ring-2"
        style={{
          backgroundColor: colors.$1,
          color: isPending ? colors.$17 : colors.$3,
          borderColor: isPending ? colors.$17 : colors.$5,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />

      <Popover className="absolute inset-y-0 right-0 flex items-center pr-1">
        {({ open, close }) => {
          if (open && !panelPos) reposition();
          if (!open && panelPos) setPanelPos(null);

          return (
            <>
              <Popover.Button
                ref={iconBtnRef}
                disabled={disabled}
                tabIndex={-1}
                className="p-1 rounded hover:opacity-80 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="note"
                title={
                  disabled
                    ? 'Stop the running timer to edit'
                    : 'Note & billable'
                }
              >
                <Message
                  size="0.95rem"
                  color={hasNote ? colors.$17 : colors.$5}
                />
              </Popover.Button>

              {open &&
                panelPos &&
                createPortal(
                  <Transition
                    show={open}
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Popover.Panel
                      static
                      className="fixed z-50 w-72 rounded-md border shadow-lg p-3 -translate-x-full"
                      style={{
                        top: panelPos.top - window.scrollY,
                        left: panelPos.left - window.scrollX,
                        backgroundColor: colors.$1,
                        borderColor: colors.$5,
                        color: colors.$3,
                      }}
                    >
                      <CellNotePanel
                        initialBillable={initialBillable}
                        initialDescription={initialDescription}
                        onEdit={onEdit}
                        onDone={() => close()}
                        onTabAway={(direction) => {
                          close();
                          // wait a tick so Popover finishes cleanup before we
                          // shift focus elsewhere.
                          setTimeout(
                            () => moveFocusToAdjacentCell(direction),
                            0
                          );
                        }}
                      />
                    </Popover.Panel>
                  </Transition>,
                  document.body
                )}
            </>
          );
        }}
      </Popover>
    </div>
  );
}

interface CellNotePanelProps {
  initialBillable: boolean;
  initialDescription: string;
  onEdit: (partial: CellEdit) => void;
  onDone: () => void;
  onTabAway: (direction: 'next' | 'prev') => void;
}

function CellNotePanel({
  initialBillable,
  initialDescription,
  onEdit,
  onDone,
  onTabAway,
}: CellNotePanelProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [billable, setBillable] = useState(initialBillable);
  const [description, setDescription] = useState(initialDescription);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const doneRef = useRef<HTMLButtonElement>(null);

  // Any Tab / Shift+Tab inside the popover dismisses it and advances focus
  // to the next/previous cell input. Intra-popover tab navigation is opt-in
  // via click — for keyboard users the popover behaves like a one-shot edit.
  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    onTabAway(event.shiftKey ? 'prev' : 'next');
  };

  return (
    <div className="space-y-3" onKeyDown={handlePanelKeyDown}>
      <div>
        <label
          className="block text-xs mb-1"
          style={{ color: colors.$17 }}
        >
          {t('description')}
        </label>
        <textarea
          ref={textareaRef}
          rows={3}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            onEdit({ description: event.target.value });
          }}
          className="w-full py-2 px-3 rounded-md text-sm border focus:outline-none focus:ring-0"
          style={{
            backgroundColor: colors.$1,
            color: colors.$3,
            borderColor: colors.$5,
          }}
        />
      </div>

      <Checkbox
        label={t('billable')}
        checked={billable}
        onValueChange={(_, checked) => {
          const next = Boolean(checked);
          setBillable(next);
          onEdit({ billable: next });
        }}
      />

      <div className="flex justify-end">
        <button
          ref={doneRef}
          type="button"
          onClick={onDone}
          className="text-sm px-3 py-1 rounded-md border"
          style={{ borderColor: colors.$5, color: colors.$3 }}
        >
          {t('done')}
        </button>
      </div>
    </div>
  );
}
