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
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import {
  taskPrimaryLabel,
  taskSecondaryLabel,
} from '../common/helpers/task-label';
import { Tooltip } from '$app/components/Tooltip';
import {
  extractTextFromHTML,
  sanitizeHTML,
} from '$app/common/helpers/html-string';
import classNames from 'classnames';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
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
import { useTaskDateDisplay } from '../common/hooks/useTaskDateDisplay';

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

export default function Daily() {
  const { documentTitle } = useTitle('daily');
  const [t] = useTranslation();
  const colors = useColorScheme();
  const reactSettings = useReactSettings();
  const navigate = useNavigate();
  const start = useStart();
  const stop = useStop();
  const { displayDate, displayTime } = useTaskDateDisplay();

  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const date = dateParam || dayjs().format('YYYY-MM-DD');

  const [quickLogVisible, setQuickLogVisible] = useState(false);

  const userFilters = useTaskUserFilters();

  const dateRangeParam = `&date_range=calculated_start_date,${date},${date}`;

  const { data, isLoading } = useTasksQuery({
    endpoint: `/api/v1/tasks?per_page=500&sort=updated_at|desc&status=active&without_deleted_clients=true${userFilters.queryString}${dateRangeParam}`,
  });

  const allTasks: Task[] = useMemo(() => data?.data ?? [], [data]);

  const entries: FlatEntry[] = useMemo(() => {
    const flat: FlatEntry[] = [];
    allTasks.forEach((task) => {
      if (task.date !== date) return;
      const logs = parseTimeLog(task.time_log) as TimeLogType[];
      logs.forEach(([s, e, desc, billable], idx) => {
        if (!s) return;
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
  }, [allTasks, date]);

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

  const isToday = date === dayjs().format('YYYY-MM-DD');

  // Tracks dates we've already duplicated *into* this mount, so the button
  // can't be re-fired and double-create. Resets implicitly when the user
  // hard-reloads or remounts the view.
  const [duplicatedDates, setDuplicatedDates] = useState<Set<string>>(
    () => new Set()
  );
  const [isDuplicating, setIsDuplicating] = useState(false);
  const duplicateDisabled =
    !isToday || isDuplicating || duplicatedDates.has(date);

  const duplicateYesterday = async () => {
    if (duplicateDisabled) return;
    setIsDuplicating(true);

    const yesterday = dayjs(date, 'YYYY-MM-DD')
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    toast.processing();

    // The page-level useTasksQuery is server-side filtered to `date` only, so
    // allTasks never contains yesterday. Fetch yesterday on demand instead
    // of widening the always-on query.
    let yesterdayTasks: Task[] = [];
    try {
      const response = await request(
        'GET',
        endpoint(
          `/api/v1/tasks?per_page=500&sort=updated_at|desc&status=active&without_deleted_clients=true${userFilters.queryString}&date_range=calculated_start_date,${yesterday},${yesterday}`
        )
      );
      yesterdayTasks = response.data?.data ?? [];
    } catch {
      toast.error();
      setIsDuplicating(false);
      return;
    }

    const tasksToCopy = yesterdayTasks
      .map((task) => ({
        task,
        logs: parseTimeLog(task.time_log) as TimeLogType[],
      }))
      .filter((item) => item.logs.length > 0);

    if (tasksToCopy.length === 0) {
      toast.dismiss();
      toast.error('no_entries_to_duplicate');
      setIsDuplicating(false);
      return;
    }

    // Create a fresh task dated today for each of yesterday's tasks, carrying
    // forward the relational metadata (client/project/rate/description) and
    // the time entries shifted by 24h.
    try {
      await Promise.all(
        tasksToCopy.map(({ task, logs }) => {
          const shifted: TimeLogType[] = logs.map(([s, e, desc, billable]) => [
            s + 86400,
            e ? e + 86400 : 0,
            desc,
            billable,
          ]);

          return request('POST', endpoint('/api/v1/tasks'), {
            client_id: task.client_id,
            project_id: task.project_id,
            assigned_user_id: task.assigned_user_id,
            status_id: task.status_id,
            description: task.description,
            rate: task.rate,
            custom_value1: task.custom_value1,
            custom_value2: task.custom_value2,
            custom_value3: task.custom_value3,
            custom_value4: task.custom_value4,
            is_date_based: task.is_date_based,
            date,
            time_log: JSON.stringify(shifted),
            ...(task.tags && { tags: task.tags }),
          });
        })
      );
      toast.success('duplicated_entries');
      $refetch(['tasks']);
      setDuplicatedDates((prev) => new Set(prev).add(date));
    } catch (raw) {
      const error = raw as AxiosError<ValidationBag>;
      const data = error?.response?.data;

      if (error?.response?.status === 422 && data) {
        // Don't dismiss before error: shared toast singleton reuses one id,
        // and dismissing it first causes the subsequent error toast to be
        // dropped by react-hot-toast.
        const messages = Object.values(data.errors ?? {}).flat();
        const combined =
          messages.length > 0 ? messages.join('\n') : data.message;
        toast.error(combined || 'error_title');
        // One or more POSTs may have succeeded before this rejected; pull
        // the truth from the server so the UI matches reality.
        $refetch(['tasks']);
      } else {
        toast.error();
      }
    } finally {
      setIsDuplicating(false);
    }
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
                {displayDate(date)}
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
            {isToday && (
              <Button
                type="secondary"
                onClick={duplicateYesterday}
                disabled={duplicateDisabled}
                disableWithoutIcon
              >
                {t('duplicate_yesterday')}
              </Button>
            )}
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
            <div
              className="p-6 text-center text-sm"
              style={{ color: colors.$17 }}
            >
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
                    {entry.task.description ? (
                      <Tooltip
                        width="auto"
                        tooltipElement={
                          <div className="w-full max-h-48 overflow-auto whitespace-normal break-all">
                            <article
                              className={classNames('prose prose-sm', {
                                'prose-invert': !reactSettings?.dark_mode,
                              })}
                              dangerouslySetInnerHTML={{
                                __html: sanitizeHTML(entry.task.description),
                              }}
                            />
                          </div>
                        }
                      >
                        <span
                          className="text-sm block truncate"
                          style={{ color: colors.$3 }}
                        >
                          {taskPrimaryLabel(entry.task)}
                        </span>
                      </Tooltip>
                    ) : (
                      <div
                        className="text-sm truncate"
                        style={{ color: colors.$3 }}
                      >
                        {entry.description
                          ? extractTextFromHTML(sanitizeHTML(entry.description))
                          : `#${entry.task.number || ''}`}
                      </div>
                    )}
                    {taskSecondaryLabel(entry.task) && (
                      <div
                        className="text-xs truncate"
                        style={{ color: colors.$17 }}
                      >
                        {taskSecondaryLabel(entry.task)}
                      </div>
                    )}
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: colors.$17 }}
                    >
                      {displayTime(entry.start)}
                      {entry.stop
                        ? ` - ${displayTime(entry.stop)}`
                        : ` · ${t('running')}`}
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
                      <Button
                        type="secondary"
                        onClick={() => start(entry.task)}
                      >
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
