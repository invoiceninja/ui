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
import { QuickLogTimeModal } from '../common/components/QuickLogTimeModal';
import { TaskHeaderControls } from '../common/components/TaskHeaderControls';
import { useTaskUserFilters } from '../common/components/TaskUserFilters';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ChevronLeft } from '$app/components/icons/ChevronLeft';
import { ChevronRight } from '$app/components/icons/ChevronRight';
import { Plus } from '$app/components/icons/Plus';
import { useStart } from '../common/hooks/useStart';
import { useStop } from '../common/hooks/useStop';
import { isTaskRunning } from '../common/helpers/calculate-entity-state';
import { TaskClock } from '../kanban/components/TaskClock';

interface FlatEntry {
  task: Task;
  logIndex: number;
  start: number;
  stop: number;
  description: string;
  billable: boolean;
}

const formatSeconds = (seconds: number) => {
  if (seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const entrySeconds = (start: number, stop: number) => {
  if (!start) return 0;
  const finish = stop || dayjs().unix();
  return Math.max(finish - start, 0);
};

export default function Timesheet() {
  const { documentTitle } = useTitle('daily');
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const start = useStart();
  const stop = useStop();

  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const date = dateParam || dayjs().format('YYYY-MM-DD');

  const [quickLogVisible, setQuickLogVisible] = useState(false);

  const userFilters = useTaskUserFilters();

  const { data, isLoading } = useTasksQuery({
    endpoint: `/api/v1/tasks?per_page=500&sort=updated_at|desc${userFilters.queryString}`,
  });

  const allTasks: Task[] = useMemo(() => data?.data ?? [], [data]);

  const dayStart = dayjs(date, 'YYYY-MM-DD').startOf('day').unix();
  const dayEnd = dayjs(date, 'YYYY-MM-DD').endOf('day').unix();

  const entries: FlatEntry[] = useMemo(() => {
    const flat: FlatEntry[] = [];
    allTasks.forEach((task) => {
      const logs = parseTimeLog(task.time_log) as TimeLogType[];
      logs.forEach(([s, e, desc, billable], idx) => {
        if (!s) return;
        if (s < dayStart || s > dayEnd) return;
        flat.push({
          task,
          logIndex: idx,
          start: s,
          stop: e,
          description: desc || '',
          billable: billable ?? true,
        });
      });
    });
    return flat.sort((a, b) => a.start - b.start);
  }, [allTasks, dayStart, dayEnd]);

  const totalSeconds = entries.reduce(
    (sum, e) => sum + entrySeconds(e.start, e.stop),
    0
  );

  const billableSeconds = entries
    .filter((e) => e.billable)
    .reduce((sum, e) => sum + entrySeconds(e.start, e.stop), 0);

  const setDate = (next: string) => {
    const updated = new URLSearchParams(searchParams);
    if (next) updated.set('date', next);
    else updated.delete('date');
    setSearchParams(updated);
  };

  const goPrev = () =>
    setDate(dayjs(date, 'YYYY-MM-DD').subtract(1, 'day').format('YYYY-MM-DD'));
  const goNext = () =>
    setDate(dayjs(date, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD'));
  const goToday = () => setDate(dayjs().format('YYYY-MM-DD'));

  const duplicateYesterday = () => {
    const yStart = dayjs(date, 'YYYY-MM-DD')
      .subtract(1, 'day')
      .startOf('day')
      .unix();
    const yEnd = dayjs(date, 'YYYY-MM-DD')
      .subtract(1, 'day')
      .endOf('day')
      .unix();

    const tasksToCopy = allTasks
      .map((task) => {
        const logs = parseTimeLog(task.time_log) as TimeLogType[];
        const yesterdayLogs = logs.filter(
          ([s]) => s && s >= yStart && s <= yEnd
        );
        return { task, logs: yesterdayLogs };
      })
      .filter((item) => item.logs.length > 0);

    if (tasksToCopy.length === 0) {
      toast.error('no_entries_to_duplicate');
      return;
    }

    toast.processing();

    Promise.all(
      tasksToCopy.map(({ task, logs }) => {
        const existing = parseTimeLog(task.time_log) as TimeLogType[];
        const shifted: TimeLogType[] = logs.map(([s, e, desc, billable]) => [
          s + 86400,
          e ? e + 86400 : 0,
          desc,
          billable,
        ]);
        const merged = [...existing, ...shifted];
        return request(
          'PUT',
          endpoint('/api/v1/tasks/:id', { id: task.id }),
          { ...task, time_log: JSON.stringify(merged) }
        );
      })
    )
      .then(() => {
        toast.success('duplicated_entries');
        $refetch(['tasks']);
      })
      .catch(() => toast.error());
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={[
        { name: t('tasks'), href: '/tasks' },
        { name: t('daily'), href: '/tasks/daily' },
      ]}
      topRight={<TaskHeaderControls />}
    >
      <QuickLogTimeModal
        visible={quickLogVisible}
        setVisible={setQuickLogVisible}
        defaults={{ date }}
      />

      <div className="px-4 md:px-6 pt-4 pb-8">
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-md border"
          style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="p-2 rounded-md border"
              style={{ borderColor: colors.$5 }}
              aria-label="prev"
            >
              <ChevronLeft size="1rem" color={colors.$3} />
            </button>

            <div className="px-3 min-w-[12rem] text-center">
              <div className="font-medium" style={{ color: colors.$3 }}>
                {dayjs(date, 'YYYY-MM-DD').format('dddd, MMM D, YYYY')}
              </div>
              <div className="text-xs" style={{ color: colors.$17 }}>
                {formatSeconds(totalSeconds)} {t('total')} ·{' '}
                {formatSeconds(billableSeconds)} {t('billable')}
              </div>
            </div>

            <button
              type="button"
              onClick={goNext}
              className="p-2 rounded-md border"
              style={{ borderColor: colors.$5 }}
              aria-label="next"
            >
              <ChevronRight size="1rem" color={colors.$3} />
            </button>

            <Button type="secondary" onClick={goToday}>
              {t('today')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="secondary" onClick={duplicateYesterday}>
              {t('duplicate_yesterday')}
            </Button>
            <Button onClick={() => setQuickLogVisible(true)}>
              <span className="inline-flex items-center gap-1">
                <Plus size="0.9rem" color="#fff" />
                {t('log_time')}
              </span>
            </Button>
          </div>
        </div>

        <div
          className="mt-4 rounded-md border overflow-hidden"
          style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
        >
          {isLoading && (
            <div className="p-6 text-center text-sm" style={{ color: colors.$17 }}>
              {t('loading')}
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <div className="p-10 text-center" style={{ color: colors.$17 }}>
              <div className="text-sm">{t('no_records_found')}</div>
              <div className="mt-3">
                <Button onClick={() => setQuickLogVisible(true)}>
                  {t('log_time')}
                </Button>
              </div>
            </div>
          )}

          {!isLoading &&
            entries.map((entry) => {
              const isRunning = entry.stop === 0;
              const seconds = entrySeconds(entry.start, entry.stop);
              return (
                <div
                  key={`${entry.task.id}-${entry.logIndex}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b cursor-pointer hover:opacity-90"
                  style={{ borderColor: colors.$5 }}
                  onClick={() => navigate(`/tasks/${entry.task.id}/edit`)}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm truncate"
                      style={{ color: colors.$3 }}
                    >
                      {entry.task.description ||
                        entry.description ||
                        `#${entry.task.number || ''}`}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: colors.$17 }}
                    >
                      {dayjs.unix(entry.start).format('h:mm A')}
                      {entry.stop ? ` – ${dayjs.unix(entry.stop).format('h:mm A')}` : ` · ${t('running')}`}
                      {entry.billable ? ` · ${t('billable')}` : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    {isRunning ? (
                      <TaskClock task={entry.task} />
                    ) : (
                      <div
                        className="font-mono text-sm"
                        style={{ color: colors.$3 }}
                      >
                        {formatSeconds(seconds)}
                      </div>
                    )}
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    {isTaskRunning(entry.task) ? (
                      <Button type="secondary" onClick={() => stop(entry.task)}>
                        {t('stop')}
                      </Button>
                    ) : (
                      <Button type="secondary" onClick={() => start(entry.task)}>
                        {t('start')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </Default>
  );
}
