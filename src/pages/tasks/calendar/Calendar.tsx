/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { isCalendarConnectionAvailable } from '$app/common/helpers';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useTitle } from '$app/common/hooks/useTitle';
import {
  CalendarEvent,
  calendarEventDateKey,
  calendarEventKey,
  calendarEventLinkKey,
  calendarTaskEventLinkKey,
} from '$app/common/interfaces/calendar-event';
import { Task } from '$app/common/interfaces/task';
import { useCalendarEventsQuery } from '$app/common/queries/calendar';
import { useTasksQuery } from '$app/common/queries/tasks';
import { Button } from '$app/components/forms';
import { ChevronLeft } from '$app/components/icons/ChevronLeft';
import { ChevronRight } from '$app/components/icons/ChevronRight';
import { Plus } from '$app/components/icons/Plus';
import { Default } from '$app/components/layouts/Default';
import { CalendarConnectCta } from '../common/components/CalendarConnectCta';
import { ConvertCalendarEventModal } from '../common/components/ConvertCalendarEventModal';
import { QuickLogTimeModal } from '../common/components/QuickLogTimeModal';
import { TaskHeaderControls } from '../common/components/TaskHeaderControls';
import { useTaskUserFilters } from '../common/components/TaskUserFilters';
import {
  buildTasksByDay,
  taskActivityDatesQueryParam,
  taskBillableSecondsOnDayKey,
  taskSecondsOnDayKey,
  totalTaskBillableSecondsOnDayKey,
  totalTaskSecondsOnDayKey,
} from '../common/helpers/activity-dates';
import { isTaskRunning } from '../common/helpers/calculate-entity-state';
import { formatTimeLogDayHours } from '../common/helpers/calculate-time';
import {
  taskCalendarLabel,
  taskPrimaryLabel,
  taskProjectAccentColor,
  taskSecondaryLabel,
} from '../common/helpers/task-label';
import { useTaskDateDisplay } from '../common/hooks/useTaskDateDisplay';

const TASK_HINT_MAX = 3;

export default function Calendar() {
  const { documentTitle } = useTitle('calendar');
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const userFilters = useTaskUserFilters();
  const { displayDate, displayTime, displayWeekday } = useTaskDateDisplay();

  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const referenceDate = dateParam || dayjs().format('YYYY-MM-DD');

  const monthAnchor = dayjs(referenceDate, 'YYYY-MM-DD').startOf('month');
  const gridStart = monthAnchor.startOf('week');
  const gridEnd = monthAnchor.endOf('month').endOf('week');
  const totalDays = gridEnd.diff(gridStart, 'day') + 1;

  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [quickLogDate, setQuickLogDate] = useState<string>(referenceDate);

  const [convertEvent, setConvertEvent] = useState<CalendarEvent | null>(null);
  const [convertVisible, setConvertVisible] = useState(false);

  const user = useCurrentUser();
  const calendarConnectionAvailable = isCalendarConnectionAvailable();
  const calendarConnected =
    calendarConnectionAvailable &&
    user?.settings?.calendar_connection?.status === 'CONNECTED';

  const hideEvents = searchParams.get('hide_events') === '1';
  const toggleHideEvents = () => {
    const updated = new URLSearchParams(searchParams);
    if (hideEvents) updated.delete('hide_events');
    else updated.set('hide_events', '1');
    setSearchParams(updated);
  };

  const cells = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => gridStart.add(i, 'day')),
    [gridStart, totalDays]
  );

  const visibleDayKeys = useMemo(
    () => new Set(cells.map((day) => day.format('YYYY-MM-DD'))),
    [cells]
  );

  const windowStart = gridStart.format('YYYY-MM-DD');
  const windowEnd = gridEnd.format('YYYY-MM-DD');
  const activityDatesParam = taskActivityDatesQueryParam(
    windowStart,
    windowEnd
  );

  const { data, isLoading } = useTasksQuery({
    endpoint: `/api/v1/tasks?per_page=500&sort=updated_at|desc&include=client,project&status=active&without_deleted_clients=true${userFilters.queryString}${activityDatesParam}`,
  });

  const allTasks: Task[] = useMemo(() => data?.data ?? [], [data]);

  const { data: calendarEvents, isError: calendarEventsError } =
    useCalendarEventsQuery({
      from: gridStart.toISOString(),
      to: gridEnd.endOf('day').toISOString(),
      enabled: calendarConnected,
    });

  const linkedEventKeys = useMemo(() => {
    const s = new Set<string>();
    allTasks.forEach((task) => {
      const key = calendarTaskEventLinkKey(task.meta);
      if (key) s.add(key);
    });
    return s;
  }, [allTasks]);

  const dailyEvents = useMemo(() => {
    const out: Record<string, CalendarEvent[]> = {};
    (calendarEvents ?? []).forEach((ev) => {
      // Already converted into a task, so hide it from the calendar entirely.
      if (linkedEventKeys.has(calendarEventLinkKey(ev))) return;
      const key = calendarEventDateKey(ev);
      (out[key] ||= []).push(ev);
    });
    Object.values(out).forEach((list) =>
      list.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    );
    return out;
  }, [calendarEvents, linkedEventKeys]);

  // dayKey -> tasks with time-log activity on that day (else task.date).
  const tasksByDay = useMemo(
    () => buildTasksByDay(allTasks, visibleDayKeys),
    [allTasks, visibleDayKeys]
  );

  const setDate = (next: string) => {
    const updated = new URLSearchParams(searchParams);
    if (next) updated.set('date', next);
    else updated.delete('date');
    setSearchParams(updated);
  };
  const prevMonth = () =>
    setDate(monthAnchor.subtract(1, 'month').format('YYYY-MM-DD'));
  const nextMonth = () =>
    setDate(monthAnchor.add(1, 'month').format('YYYY-MM-DD'));
  const goToday = () => setDate(dayjs().format('YYYY-MM-DD'));

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        displayWeekday(gridStart.add(i, 'day'))
      ),
    [displayWeekday, gridStart]
  );

  return (
    <Default
      title={documentTitle}
      breadcrumbs={[
        { name: t('tasks'), href: '/tasks' },
        { name: t('calendar'), href: '/tasks/calendar' },
      ]}
      topRight={<TaskHeaderControls />}
    >
      <QuickLogTimeModal
        visible={quickLogVisible}
        setVisible={setQuickLogVisible}
        defaults={{ date: quickLogDate }}
      />

      <ConvertCalendarEventModal
        visible={convertVisible}
        setVisible={setConvertVisible}
        event={convertEvent}
        alreadyLinked={
          convertEvent
            ? linkedEventKeys.has(calendarEventLinkKey(convertEvent))
            : false
        }
      />

      <div className="px-4 md:px-6 pt-4 pb-8">
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-md border"
          style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-md border"
              style={{ borderColor: colors.$5 }}
              aria-label={t('previous') as string}
            >
              <ChevronLeft size="1rem" color={colors.$3} />
            </button>

            <div className="px-3 text-center">
              <div className="font-medium" style={{ color: colors.$3 }}>
                {displayDate(monthAnchor)}
              </div>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-md border"
              style={{ borderColor: colors.$5 }}
              aria-label={t('next') as string}
            >
              <ChevronRight size="1rem" color={colors.$3} />
            </button>

            <Button type="secondary" onClick={goToday}>
              {t('today')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {calendarConnected && (
              <Tippy
                duration={0}
                content={hideEvents ? t('show_events') : t('hide_events')}
                className="rounded-md text-xs p-2 bg-[#F2F2F2] text-black"
              >
                <span className="inline-flex">
                  <Button
                    type="secondary"
                    onClick={toggleHideEvents}
                    aria-label={
                      (hideEvents
                        ? t('show_events')
                        : t('hide_events')) as string
                    }
                  >
                    {hideEvents ? (
                      <AiFillEyeInvisible size={16} />
                    ) : (
                      <AiFillEye size={16} />
                    )}
                  </Button>
                </span>
              </Tippy>
            )}

            {calendarConnectionAvailable && <CalendarConnectCta />}

            <Button
              onClick={() => {
                setQuickLogDate(referenceDate);
                setQuickLogVisible(true);
              }}
            >
              <span className="inline-flex items-center gap-1">
                <Plus size="0.9rem" color="#fff" />
                {t('log_time')}
              </span>
            </Button>
          </div>
        </div>

        {calendarEventsError && (
          <div
            className="mt-3 px-3 py-2 rounded-md text-xs"
            style={{
              backgroundColor: colors.$2,
              color: colors.$17,
              borderColor: colors.$5,
            }}
          >
            {t('calendar_unavailable')}
          </div>
        )}

        <div
          className="mt-4 rounded-md border overflow-hidden"
          style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
        >
          <div
            className="grid grid-cols-7 border-b text-center text-xs py-2"
            style={{ borderColor: colors.$5, color: colors.$17 }}
          >
            {weekdayLabels.map((label, index) => (
              <div key={`${index}-${label}`}>{label}</div>
            ))}
          </div>

          {isLoading ? (
            <div
              className="p-10 text-center text-sm"
              style={{ color: colors.$17 }}
            >
              {t('loading')}
            </div>
          ) : (
            <div className="grid grid-cols-7 auto-rows-fr">
              {(() => {
                const today = dayjs();
                return cells.map((day) => {
                  const dayKey = day.format('YYYY-MM-DD');
                  const isCurrentMonth = day.month() === monthAnchor.month();
                  const isToday = day.isSame(today, 'day');
                  const events = hideEvents ? [] : (dailyEvents[dayKey] ?? []);
                  const visibleEvents = events.slice(0, 3);
                  const overflowEvents = events.slice(visibleEvents.length);
                  const overflowCount = overflowEvents.length;
                  const dayTasks = tasksByDay[dayKey] ?? [];
                  const visibleTaskHints = dayTasks.slice(0, TASK_HINT_MAX);
                  const overflowTaskHints = dayTasks.slice(TASK_HINT_MAX);

                  const openDay = () => navigate(`/tasks/daily?date=${dayKey}`);
                  const openTask = (task: Task) =>
                    navigate(`/tasks/${task.id}/edit`);

                  const taskOverview = (task: Task, dayKeyForHours: string) => {
                    const secondary = taskSecondaryLabel(task);
                    const dayHours = formatTimeLogDayHours(
                      taskSecondsOnDayKey(task, dayKeyForHours)
                    );
                    const billableHours = formatTimeLogDayHours(
                      taskBillableSecondsOnDayKey(task, dayKeyForHours)
                    );

                    return (
                      <div className="text-left max-w-[18rem]">
                        <div className="font-medium truncate">
                          {taskPrimaryLabel(task, 90)}
                        </div>
                        {secondary && (
                          <div className="text-[10px] opacity-70 truncate mt-0.5">
                            {secondary}
                          </div>
                        )}
                        {dayHours && (
                          <div className="font-mono text-[10px] opacity-70 mt-1">
                            {dayHours} {t('hours')}
                            {billableHours
                              ? ` · ${billableHours} ${t('billable')}`
                              : null}
                          </div>
                        )}
                        {isTaskRunning(task) && (
                          <div
                            className="text-[10px] mt-1"
                            style={{ color: '#b91c1c' }}
                          >
                            {t('running')}
                          </div>
                        )}
                        <div className="font-mono text-[10px] opacity-70 mt-1">
                          #{task.number || task.id.slice(0, 6)}
                        </div>
                      </div>
                    );
                  };

                  const daySummary = (
                    dayKeyForSummary: string,
                    tasks: Task[]
                  ) => {
                    const totalSeconds = totalTaskSecondsOnDayKey(
                      tasks,
                      dayKeyForSummary
                    );
                    const billableSeconds = totalTaskBillableSecondsOnDayKey(
                      tasks,
                      dayKeyForSummary
                    );
                    const totalHours = formatTimeLogDayHours(totalSeconds);
                    const billableHours =
                      formatTimeLogDayHours(billableSeconds);

                    return (
                      <div className="text-left max-w-[18rem] space-y-1">
                        {totalHours && (
                          <div className="font-mono text-[10px]">
                            {totalHours} {t('hours')}
                            {billableHours
                              ? ` · ${billableHours} ${t('billable')}`
                              : null}
                          </div>
                        )}
                        {tasks.map((task) => {
                          const hours = formatTimeLogDayHours(
                            taskSecondsOnDayKey(task, dayKeyForSummary)
                          );
                          return (
                            <div
                              key={task.id}
                              className="text-[10px] truncate opacity-90"
                            >
                              {taskPrimaryLabel(task, 40)}
                              {hours ? (
                                <span className="font-mono opacity-70">
                                  {' '}
                                  · {hours}
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    );
                  };

                  const eventOverflowTooltipContent =
                    overflowEvents.length > 0 ? (
                      <div className="text-left space-y-1">
                        {overflowEvents.map((ev) => {
                          const ProviderIcon =
                            ev.provider === 'google' ? FaGoogle : FaMicrosoft;

                          return (
                            <div
                              key={calendarEventKey(ev)}
                              className="flex items-center gap-2 max-w-[18rem]"
                            >
                              <ProviderIcon size={10} />
                              {!ev.all_day && (
                                <span className="font-mono text-[10px] opacity-70">
                                  {displayTime(ev.start)}
                                </span>
                              )}
                              <span className="truncate">{ev.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null;

                  const cell = (
                    <div
                      key={dayKey}
                      role="button"
                      tabIndex={0}
                      onClick={openDay}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openDay();
                        }
                      }}
                      className="text-left p-2 min-h-[5rem] border-b border-r last:border-r-0 hover:opacity-95 focus:outline-none focus:ring-2 cursor-pointer"
                      style={{
                        borderColor: colors.$5,
                        backgroundColor: isCurrentMonth ? colors.$1 : colors.$2,
                        color: isCurrentMonth ? colors.$3 : colors.$17,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        {(() => {
                          const dayNumber = (
                            <span
                              className={
                                isToday
                                  ? 'inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1 rounded-full text-xs font-semibold tabular-nums leading-none'
                                  : 'text-xs font-medium tabular-nums leading-none'
                              }
                              style={
                                isToday
                                  ? {
                                      backgroundColor: colors.$18,
                                      color: colors.$1,
                                    }
                                  : {
                                      color: isCurrentMonth
                                        ? colors.$3
                                        : colors.$17,
                                    }
                              }
                            >
                              {day.date()}
                            </span>
                          );

                          if (dayTasks.length === 0) {
                            return dayNumber;
                          }

                          return (
                            <Tippy
                              duration={0}
                              delay={[300, 0]}
                              placement="top"
                              content={daySummary(dayKey, dayTasks)}
                              className="rounded-md text-xs p-2 bg-[#F2F2F2] text-black shadow"
                            >
                              <span
                                className="inline-flex"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {dayNumber}
                              </span>
                            </Tippy>
                          );
                        })()}
                      </div>

                      {dayTasks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {visibleTaskHints.map((task) => {
                            const accent = taskProjectAccentColor(task);
                            const running = isTaskRunning(task);
                            return (
                              <Tippy
                                key={task.id}
                                duration={0}
                                delay={[200, 0]}
                                placement="top"
                                content={taskOverview(task, dayKey)}
                                className="rounded-md text-xs p-2 bg-[#F2F2F2] text-black shadow"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openTask(task);
                                  }}
                                  className="inline-flex max-w-full items-center gap-1 rounded border px-1 py-0.5 text-[9px] leading-none"
                                  style={{
                                    borderColor: colors.$5,
                                    backgroundColor: colors.$2,
                                    color: colors.$3,
                                    borderLeftWidth: accent ? 3 : 1,
                                    borderLeftColor: accent ?? colors.$5,
                                  }}
                                  aria-label={taskCalendarLabel(task)}
                                >
                                  {running && (
                                    <span
                                      className="inline-block w-1.5 h-1.5 shrink-0 rounded-full animate-pulse"
                                      style={{ backgroundColor: '#dc2626' }}
                                    />
                                  )}
                                  <span className="truncate max-w-[4.5rem]">
                                    {taskPrimaryLabel(task, 22)}
                                  </span>
                                </button>
                              </Tippy>
                            );
                          })}

                          {overflowTaskHints.length > 0 && (
                            <Tippy
                              duration={0}
                              delay={[200, 0]}
                              placement="top"
                              interactive
                              content={
                                <div className="text-left space-y-1 max-w-[18rem]">
                                  {overflowTaskHints.map((task) => {
                                    const dayHours = formatTimeLogDayHours(
                                      taskSecondsOnDayKey(task, dayKey)
                                    );
                                    return (
                                      <button
                                        key={task.id}
                                        type="button"
                                        className="block w-full text-left truncate hover:underline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openTask(task);
                                        }}
                                      >
                                        {taskPrimaryLabel(task, 90)}
                                        {dayHours ? (
                                          <span className="font-mono opacity-70">
                                            {' '}
                                            · {dayHours}
                                          </span>
                                        ) : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              }
                              className="rounded-md text-xs p-2 bg-[#F2F2F2] text-black shadow"
                            >
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border px-1 text-[10px]"
                                style={{
                                  borderColor: colors.$5,
                                  backgroundColor: colors.$2,
                                  color: colors.$17,
                                }}
                                aria-label={t('more') as string}
                              >
                                +{overflowTaskHints.length}
                              </button>
                            </Tippy>
                          )}
                        </div>
                      )}

                      {visibleEvents.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {visibleEvents.map((ev) => {
                            const key = calendarEventKey(ev);
                            const ProviderIcon =
                              ev.provider === 'google' ? FaGoogle : FaMicrosoft;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConvertEvent(ev);
                                  setConvertVisible(true);
                                }}
                                className="w-full flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate"
                                style={{
                                  backgroundColor: colors.$2,
                                  color: colors.$3,
                                }}
                                title={ev.title}
                              >
                                <ProviderIcon size={9} />
                                {!ev.all_day && (
                                  <span className="font-mono">
                                    {displayTime(ev.start)}
                                  </span>
                                )}
                                <span className="truncate flex-1 text-left">
                                  {ev.title}
                                </span>
                              </button>
                            );
                          })}
                          {eventOverflowTooltipContent && (
                            <Tippy
                              duration={0}
                              delay={[200, 0]}
                              placement="top"
                              content={eventOverflowTooltipContent}
                              className="rounded-md text-xs p-2 bg-[#F2F2F2] text-black shadow"
                            >
                              <div
                                className="text-[10px] text-right"
                                style={{ color: colors.$17 }}
                              >
                                +{overflowCount} {t('more_count')}
                              </div>
                            </Tippy>
                          )}
                        </div>
                      )}
                    </div>
                  );

                  return cell;
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </Default>
  );
}
