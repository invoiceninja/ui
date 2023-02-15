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

export function handleTaskTimeChange(
  log: string,
  unix: number,
  time: string,
  position: number,
  index: number
) {
  const date = unix ? parseTimeToDate(unix) : parseTimeToDate(dayjs().unix());

  const unixTimestamp = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss').unix();

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
  const time = unix ? parseTime(unix) : parseTime(dayjs().unix());

  const unixTimestamp = dayjs(`${value} ${time}`, 'YYYY-MM-DD HH:mm:ss').unix();

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
