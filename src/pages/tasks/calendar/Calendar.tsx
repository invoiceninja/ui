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
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import {
  TaskUserFilters,
  useTaskUserFilters,
} from '../common/components/TaskUserFilters';
import { ChevronLeft } from '$app/components/icons/ChevronLeft';
import { ChevronRight } from '$app/components/icons/ChevronRight';
import { Plus } from '$app/components/icons/Plus';
import { QuickLogTimeModal } from '../common/components/QuickLogTimeModal';
import { TaskViewSwitcher } from '../common/components/TaskViewSwitcher';

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

  const cells = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => gridStart.add(i, 'day')),
    [gridStart, totalDays]
  );

  const { data, isLoading } = useTasksQuery({
    endpoint: `/api/v1/tasks?per_page=500&sort=updated_at|desc${userFilters.queryString}`,
  });

  const allTasks: Task[] = useMemo(() => data?.data ?? [], [data]);

  // dayKey → { total, billable }
  const dailyTotals = useMemo(() => {
    const out: Record<string, { total: number; billable: number }> = {};
    allTasks.forEach((task) => {
      const logs = parseTimeLog(task.time_log) as TimeLogType[];
      logs.forEach(([s, e, , billable]) => {
        if (!s) return;
        const finish = e || dayjs().unix();
        const seconds = Math.max(finish - s, 0);
        if (seconds <= 0) return;
        const key = dayjs.unix(s).format('YYYY-MM-DD');
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
      topRight={<TaskViewSwitcher />}
    >
      <QuickLogTimeModal
        visible={quickLogVisible}
        setVisible={setQuickLogVisible}
        defaults={{ date: quickLogDate }}
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

            <TaskUserFilters state={userFilters} />
          </div>

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

                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() =>
                      navigate(`/tasks/daily?date=${dayKey}`)
                    }
                    className="text-left p-2 min-h-[5rem] border-b border-r last:border-r-0 hover:opacity-95 focus:outline-none focus:ring-2"
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
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Default>
  );
}
