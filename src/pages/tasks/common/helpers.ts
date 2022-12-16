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

  return dayjs.unix(timestamp).format('hh:mm:ss');
}

export function duration(start: number, stop: number) {
  const diff = dayjs.unix(stop).diff(dayjs.unix(start), 'seconds');

  if (diff < 0) {
    return;
  }

  return new Date(diff * 1000).toISOString().slice(11, 19);
}

export function handleTaskTimeChange(
  log: string,
  unix: number,
  time: string,
  position: number,
  index: number
) {
  const date = parseTimeToDate(unix);

  const unixTimestamp = dayjs(`${date} ${time}`, 'YYYY-MM-DD hh:mm:ss').unix();

  const logs = parseTimeLog(log);

  logs[index][position] = unixTimestamp;

  return JSON.stringify(logs);
}

export function handleTaskDateChange(
  log: string,
  unix: number,
  value: string,
  index: number,
  position: number
) {
  const time = parseTime(unix);

  const unixTimestamp = dayjs(`${value} ${time}`, 'YYYY-MM-DD hh:mm:ss').unix();

  const logs = parseTimeLog(log);

  logs[index][position] = unixTimestamp;

  return JSON.stringify(logs);
}

export function handleTaskDurationChange(
  log: string,
  value: string,
  start: number,
  index: number
) {
  let date = dayjs.unix(start);
  const parts = value.split(':');

  if (parts[0]) {
    date = date.add(parseFloat(parts[0]), 'hour');
  }

  if (parts[1]) {
    date = date.add(parseFloat(parts[1]), 'minute');
  }

  if (parts[2]) {
    date = date.add(parseFloat(parts[2]), 'second');
  }

  const logs = parseTimeLog(log);

  logs[index][1] = date.unix();

  return JSON.stringify(logs);
}
