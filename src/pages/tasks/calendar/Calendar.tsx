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
import { Button } from '$app/components/forms';
import { useTitle } from '$app/common/hooks/useTitle';
import { useTasksQuery } from '$app/common/queries/tasks';
import { Task } from '$app/common/interfaces/task';
import {
  parseTimeLog,
  TimeLogType,
} from '$app/pages/tasks/common/helpers/calculate-time';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useTaskUserFilters } from '../common/components/TaskUserFilters';
import { ChevronLeft } from '$app/components/icons/ChevronLeft';
import { ChevronRight } from '$app/components/icons/ChevronRight';
import { Plus } from '$app/components/icons/Plus';
import { QuickLogTimeModal } from '../common/components/QuickLogTimeModal';
import { TaskHeaderControls } from '../common/components/TaskHeaderControls';
import { CalendarConnectCta } from '../common/components/CalendarConnectCta';
import { ConvertCalendarEventModal } from '../common/components/ConvertCalendarEventModal';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useCalendarEventsQuery } from '$app/common/queries/calendar';
import {
  CalendarEvent,
  calendarEventKey,
} from '$app/common/interfaces/calendar-event';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';

const formatHours = (seconds: number) => {
  if (!seconds) return '';
  const hours = seconds / 3600;
  return hours.toFixed(2).replace(/\.00$/, '') + 'h';
};

export default function Calendar() {
  const { documentTitle } = useTitle('calendar');
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const userFilters = useTaskUserFilters();

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
  const calendarConnected = Boolean(user?.referral_meta?.calendar_connection);

  // If we landed here as the OAuth popup (named when opened by
  // CalendarConnectCta), ping the opener and close immediately so the parent
  // window — not this popup — shows the connected calendar.
  useEffect(() => {
    if (
      searchParams.get('calendar_connected') === '1' &&
      window.name === 'calendar-oauth'
    ) {
      try {
        window.opener?.postMessage(
          { type: 'calendar:connected' },
          window.location.origin
        );
      } catch {
        // opener may be blocked by COOP; closing is enough
      }
      window.close();
    }
  }, [searchParams]);

  const cells = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => gridStart.add(i, 'day')),
    [gridStart, totalDays]
  );

  const windowStart = gridStart.format('YYYY-MM-DD');
  const windowEnd = gridEnd.format('YYYY-MM-DD');
  const dateRangeParam = `&date_range=calculated_start_date,${windowStart},${windowEnd}`;

  const { data, isLoading } = useTasksQuery({
    endpoint: `/api/v1/tasks?per_page=500&sort=updated_at|desc${userFilters.queryString}${dateRangeParam}`,
  });

  const allTasks: Task[] = useMemo(() => data?.data ?? [], [data]);

  const { data: calendarEvents, isError: calendarEventsError } =
    useCalendarEventsQuery({
      from: gridStart.toISOString(),
      to: gridEnd.endOf('day').toISOString(),
      enabled: calendarConnected,
    });

  const dailyEvents = useMemo(() => {
    const out: Record<string, CalendarEvent[]> = {};
    (calendarEvents ?? []).forEach((ev) => {
      const key = dayjs(ev.start).format('YYYY-MM-DD');
      (out[key] ||= []).push(ev);
    });
    Object.values(out).forEach((list) =>
      list.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    );
    return out;
  }, [calendarEvents]);

  const linkedEventKeys = useMemo(() => {
    const s = new Set<string>();
    allTasks.forEach((task) => {
      if (task.meta?.calendar_event_id) s.add(task.meta.calendar_event_id);
    });
    return s;
  }, [allTasks]);

  // dayKey → { total, billable } — bucketed by task.date, summing every log
  // entry on that task.
  const dailyTotals = useMemo(() => {
    const out: Record<string, { total: number; billable: number }> = {};
    allTasks.forEach((task) => {
      const key = task.date;
      if (!key) return;
      const logs = parseTimeLog(task.time_log) as TimeLogType[];
      logs.forEach(([s, e, , billable]) => {
        if (!s) return;
        const finish = e || dayjs().unix();
        const seconds = Math.max(finish - s, 0);
        if (seconds <= 0) return;
        if (!out[key]) out[key] = { total: 0, billable: 0 };
        out[key].total += seconds;
        if (billable !== false) out[key].billable += seconds;
      });
    });
    return out;
  }, [allTasks]);

  const monthTotalSeconds = cells.reduce((sum, day) => {
    if (day.month() !== monthAnchor.month()) return sum;
    return sum + (dailyTotals[day.format('YYYY-MM-DD')]?.total ?? 0);
  }, 0);

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
      Array.from({ length: 7 }, (_, i) => gridStart.add(i, 'day').format('ddd')),
    [gridStart]
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
            ? linkedEventKeys.has(calendarEventKey(convertEvent))
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
              aria-label="prev month"
            >
              <ChevronLeft size="1rem" color={colors.$3} />
            </button>

            <div className="px-3 text-center">
              <div className="font-medium" style={{ color: colors.$3 }}>
                {monthAnchor.format('MMMM YYYY')}
              </div>
              <div className="text-xs" style={{ color: colors.$17 }}>
                {(monthTotalSeconds / 3600).toFixed(2)} {t('hours')}
              </div>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-md border"
              style={{ borderColor: colors.$5 }}
              aria-label="next month"
            >
              <ChevronRight size="1rem" color={colors.$3} />
            </button>

            <Button type="secondary" onClick={goToday}>
              {t('today')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarConnectCta />

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
            {weekdayLabels.map((label) => (
              <div key={label}>{label}</div>
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
              {cells.map((day) => {
                const dayKey = day.format('YYYY-MM-DD');
                const isCurrentMonth = day.month() === monthAnchor.month();
                const isToday = day.isSame(dayjs(), 'day');
                const totals = dailyTotals[dayKey];
                const total = totals?.total ?? 0;
                const billable = totals?.billable ?? 0;
                const events = dailyEvents[dayKey] ?? [];
                const visibleEvents = events.slice(0, 3);
                const overflowCount = events.length - visibleEvents.length;

                const openDay = () => navigate(`/tasks/daily?date=${dayKey}`);

                return (
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
                      opacity: isCurrentMonth ? 1 : 0.6,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          isToday
                            ? 'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold'
                            : 'text-xs font-medium'
                        }
                        style={
                          isToday
                            ? { backgroundColor: '#2176FF', color: '#fff' }
                            : undefined
                        }
                      >
                        {day.format('D')}
                      </span>
                      {total > 0 && (
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: colors.$17 }}
                        >
                          {formatHours(total)}
                        </span>
                      )}
                    </div>

                    {total > 0 && (
                      <div className="mt-2 text-xs space-y-0.5">
                        <div
                          className="font-mono"
                          style={{ color: colors.$3 }}
                        >
                          {(total / 3600).toFixed(2)} {t('total')}
                        </div>
                        {billable !== total && (
                          <div
                            className="font-mono text-[10px]"
                            style={{ color: colors.$17 }}
                          >
                            {(billable / 3600).toFixed(2)} {t('billable')}
                          </div>
                        )}
                      </div>
                    )}

                    {visibleEvents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {visibleEvents.map((ev) => {
                          const key = calendarEventKey(ev);
                          const linked = linkedEventKeys.has(key);
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
                                color: linked ? colors.$17 : colors.$3,
                                opacity: linked ? 0.7 : 1,
                              }}
                              title={ev.summary}
                            >
                              <ProviderIcon size={9} />
                              {!ev.all_day && (
                                <span className="font-mono">
                                  {dayjs(ev.start).format('HH:mm')}
                                </span>
                              )}
                              <span className="truncate flex-1 text-left">
                                {ev.summary}
                              </span>
                              {linked && <span aria-hidden>✓</span>}
                            </button>
                          );
                        })}
                        {overflowCount > 0 && (
                          <div
                            className="text-[10px] text-right"
                            style={{ color: colors.$17 }}
                          >
                            +{overflowCount} {t('more_count')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Default>
  );
}
