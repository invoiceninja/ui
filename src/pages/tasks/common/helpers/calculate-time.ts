/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

export type TimeLogType = [number, number, string, boolean];
export type TimeLogsType = TimeLogType[];

export function parseTimeLog(log: string) {
  if (log === '' || log === '[]') {
    return [];
  }

  const defaultRow: TimeLogsType = [[0, 0, '', true]];
  const parsed: TimeLogsType = JSON.parse(log);

  if (!parsed.length) {
    return defaultRow;
  }

  return parsed;
}

export function timeLogSegmentEndUnix(end: number): number {
  return end || Math.floor(Date.now() / 1000);
}

/** True when any part of [start, end] falls on this calendar day. */
export function timeLogSegmentOverlapsDayKey(
  start: number,
  end: number,
  dayKey: string
): boolean {
  if (!start) return false;
  const finish = timeLogSegmentEndUnix(end);
  const day = dayjs(dayKey, 'YYYY-MM-DD');
  const dayStart = day.startOf('day').unix();
  const dayEnd = day.endOf('day').unix();
  return start <= dayEnd && finish >= dayStart;
}

/** Seconds of this segment attributed to dayKey (clipped to that day). */
export function timeLogSegmentSecondsOnDayKey(
  start: number,
  end: number,
  dayKey: string
): number {
  if (!start) return 0;
  const finish = timeLogSegmentEndUnix(end);
  const day = dayjs(dayKey, 'YYYY-MM-DD');
  const dayStart = day.startOf('day').unix();
  const dayEnd = day.endOf('day').unix();
  if (start > dayEnd || finish < dayStart) return 0;
  const overlapStart = Math.max(start, dayStart);
  const overlapEnd = Math.min(finish, dayEnd);
  return Math.max(overlapEnd - overlapStart, 0);
}

export function timeLogBillableSecondsOnDayKey(
  log: string,
  dayKey: string
): number {
  return parseTimeLog(log).reduce((sum, [start, end, , billable]) => {
    if (billable === false) return sum;
    return sum + timeLogSegmentSecondsOnDayKey(start, end, dayKey);
  }, 0);
}

export function timeLogSecondsOnDayKey(log: string, dayKey: string): number {
  return parseTimeLog(log).reduce(
    (sum, [start, end]) =>
      sum + timeLogSegmentSecondsOnDayKey(start, end, dayKey),
    0
  );
}

/** Decimal hours for calendar cells (matches weekly grid). */
export function formatTimeLogDayHours(seconds: number): string {
  if (!seconds) return '';
  const hours = seconds / 3600;
  return hours.toFixed(2).replace(/\.00$/, '');
}

export function calculateHours(log: string, includeRunning = false) {
  const times = parseTimeLog(log);

  let seconds = 0;

  for (const [start, finish] of times) {
    if (start > finish && !includeRunning) {
      continue;
    }

    const finishTime =
      finish !== 0
        ? typeof finish === 'number'
          ? finish
          : 0
        : Math.floor(Date.now() / 1000);
    const durationInSeconds =
      finishTime - (typeof start === 'number' ? start : 0);

    seconds += Math.max(durationInSeconds, 0);
  }

  const totalHours = Math.floor(seconds / 3600);
  const totalMinutes = Math.floor((seconds % 3600) / 60);
  const totalSecondsRemaining = seconds % 60;

  if (totalHours < 24) {
    return `${totalHours}:${totalMinutes
      .toString()
      .padStart(2, '0')}:${totalSecondsRemaining.toString().padStart(2, '0')}`;
  }

  return `${totalHours}h`;
}

interface CalculateTimeOptions {
  inSeconds?: boolean;
  calculateLastTimeLog?: boolean;
}

export function calculateTime(log: string, options?: CalculateTimeOptions) {
  const times = parseTimeLog(log);
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  let seconds = 0;

  if (options?.calculateLastTimeLog) {
    const lastLogIndex = times.length - 1;

    const start = times[lastLogIndex][0];
    const startTime = start ? dayjs.unix(start) : dayjs();

    seconds += dayjs().diff(startTime, 'seconds');
  } else {
    times.map(([start, stop]) => {
      const startTime = start ? dayjs.unix(start) : dayjs();
      const stopTime = stop ? dayjs.unix(stop) : dayjs();

      seconds += stopTime.diff(startTime, 'seconds');
    });
  }

  if (options?.inSeconds) {
    return seconds.toString();
  }

  return seconds > 86400
    ? dayjs.duration(seconds, 'seconds').humanize()
    : dayjs.duration(seconds, 'seconds').format('HH:mm:ss');
}

export function calculateDifferenceBetweenLogs(log: string, logIndex: number) {
  const times = parseTimeLog(log);
  const logTimes = times[logIndex];

  const start = logTimes ? dayjs.unix(logTimes[0]) : dayjs();
  const end = logTimes ? dayjs.unix(logTimes[1]) : dayjs();

  const seconds = end.diff(start, 'seconds');

  return new Date(seconds * 1000).toISOString().slice(11, 19);
}
