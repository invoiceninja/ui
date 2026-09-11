import dayjs from 'dayjs';
import type { Task } from '$app/common/interfaces/task';
import { isTaskRunning } from '../common/helpers/calculate-entity-state';
import type { TimeLogType } from '../common/helpers/calculate-time';

/** End timestamps are exclusive: an entry ending at midnight belongs to the prior day. */
export function weeklyCellReadOnlyReason(
  task: Task,
  logs: TimeLogType[],
  dayKey: string
): string | undefined {
  if (task.invoice_id) return 'weekly_invoiced_read_only';
  if (isTaskRunning(task)) return 'weekly_running_read_only';

  const day = dayjs(dayKey).startOf('day');
  const start = day.unix();
  const end = day.add(1, 'day').unix();
  const entries = logs.filter(
    ([s, e]) =>
      s && ((s >= start && s < end) || (s < start && (!e || e > start)))
  );
  if (entries.length > 1) return 'weekly_multiple_entries_read_only';
  if (entries.some(([s, e]) => !e || s < start || e > end)) {
    return 'weekly_overnight_read_only';
  }
}
