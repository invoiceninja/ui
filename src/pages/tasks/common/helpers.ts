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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { LogPosition } from './components/TaskTable';
import { parseTimeLog } from './helpers/calculate-time';

export function parseTimeToDate(timestamp: number) {
  if (timestamp === 0) {
    return;
  }

  return dayjs.unix(timestamp).format('YYYY-MM-DD');
}

export function parseTime(timestamp: number) {
  if (timestamp === 0) {
    return;
  }

  return dayjs.unix(timestamp).format('HH:mm:ss');
}

export function duration(
  start: number,
  stop: number,
  includedEndDate: boolean
) {
  const startDateValue = parseTimeToDate(start);
  const endTimeValue = parseTime(stop);

  let diff = dayjs.unix(stop).diff(dayjs.unix(start), 'seconds');

  if (!includedEndDate && diff < 0 && stop) {
    const modifiedEndTimeStamp = dayjs(
      `${startDateValue} ${endTimeValue}`,
      'YYYY-MM-DD HH:mm:ss'
    ).unix();

    diff = dayjs.unix(modifiedEndTimeStamp).diff(dayjs.unix(start), 'seconds');
  }

  if (diff < 0) {
    return '00:00:00';
  }

  if (stop && startDateValue !== '1970-01-01') {
    let hours = Math.floor(diff / 3600).toString();
    diff -= Number(hours) * 3600;

    let minutes = Math.floor(diff / 60).toString();
    diff -= Number(minutes) * 60;

    let seconds = diff.toString();

    if (Number(hours) < 10) {
      hours = '0' + hours.toString();
    }

    if (Number(minutes) < 10) {
      minutes = '0' + minutes.toString();
    }

    if (Number(seconds) < 10) {
      seconds = '0' + seconds.toString();
    }

    return hours + ':' + minutes + ':' + seconds;
  } else {
    return '00:00:00';
  }
}

export function useHandleTaskTimeChange() {
  const company = useCurrentCompany();

  return (
    log: string,
    unix: number,
    time: string,
    position: number,
    index: number
  ) => {
    const logs = parseTimeLog(log);

    const startLog = logs[index][LogPosition.Start];

    const date =
      unix && company.show_task_end_date
        ? parseTimeToDate(unix)
        : parseTimeToDate(startLog || dayjs().unix());

    const unixTimestamp = dayjs(
      `${date} ${time}`,
      'YYYY-MM-DD HH:mm:ss'
    ).unix();

    logs[index][position] = unixTimestamp;

    return JSON.stringify(logs);
  };
}

export function useHandleTaskDateChange() {
  const company = useCurrentCompany();

  return (
    log: string,
    unix: number,
    value: string,
    index: number,
    position: number
  ) => {
    const time = unix ? parseTime(unix) : parseTime(dayjs().unix());

    const unixTimestamp = dayjs(
      `${value} ${time}`,
      'YYYY-MM-DD HH:mm:ss'
    ).unix();

    const logs = parseTimeLog(log);

    logs[index][position] = unixTimestamp;

    if (
      company &&
      !company.show_task_end_date &&
      logs[index][LogPosition.End]
    ) {
      const endTime = parseTime(logs[index][LogPosition.End]);

      const unixTimestampEndLog = dayjs(
        `${value} ${endTime}`,
        'YYYY-MM-DD HH:mm:ss'
      ).unix();

      logs[index][LogPosition.End] = unixTimestampEndLog;
    }

    return JSON.stringify(logs);
  };
}

// Parses a flexible duration input into seconds.
// Accepts: "1.5" (decimal hours), "1:30" (h:m), "1:30:45" (h:m:s),
// "1h30m", "90m", "45s", "1h", or a bare integer (treated as hours).
// Returns null on unparsable input.
export function parseDurationToSeconds(value: string): number | null {
  const raw = (value ?? '').trim().toLowerCase();

  if (!raw) {
    return 0;
  }

  if (/^\d+(\.\d+)?$/.test(raw)) {
    return Math.round(parseFloat(raw) * 3600);
  }

  if (/^[\d:.]+$/.test(raw) && raw.includes(':')) {
    const parts = raw.split(':');
    const h = parseFloat(parts[0] || '0') || 0;
    const m = parseFloat(parts[1] || '0') || 0;
    const s = parseFloat(parts[2] || '0') || 0;
    return Math.round(h * 3600 + m * 60 + s);
  }

  const tokenRe = /(\d+(?:\.\d+)?)\s*([hms])/g;
  let match;
  let total = 0;
  let matched = false;

  while ((match = tokenRe.exec(raw)) !== null) {
    matched = true;
    const n = parseFloat(match[1]);
    if (match[2] === 'h') total += n * 3600;
    else if (match[2] === 'm') total += n * 60;
    else total += n;
  }

  return matched ? Math.round(total) : null;
}

export function handleTaskDurationChange(
  log: string,
  value: string,
  start: number,
  index: number
) {
  const seconds = parseDurationToSeconds(value);

  const logs = parseTimeLog(log);

  if (seconds === null) {
    return JSON.stringify(logs);
  }

  logs[index][1] = dayjs.unix(start).add(seconds, 'second').unix();

  return JSON.stringify(logs);
}
