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

  const formattedTimestamp = dayjs.unix(timestamp).format('hh:mm:ss A');

  const [timeValues] = formattedTimestamp.split(' ');

  const [hours, minutes, seconds] = timeValues.split(':');

  if (formattedTimestamp.includes('PM')) {
    const updatedHours = Number(hours) + 12;

    return (
      updatedHours.toString() +
      ':' +
      minutes.toString() +
      ':' +
      seconds.toString()
    );
  }

  const updatedHours = Number(hours) === 12 ? '00' : hours;

  return (
    updatedHours.toString() +
    ':' +
    minutes.toString() +
    ':' +
    seconds.toString()
  );
}

export const combineDateAndTime = (
  date: string | undefined,
  time: string | undefined
) => {
  if (date && time) {
    const dateValue = new Date(date);
    const [hours, minutes, seconds] = time.split(':');

    dateValue.setHours(Number(hours));
    dateValue.setMinutes(Number(minutes));
    dateValue.setSeconds(Number(seconds));

    return dateValue;
  }
};

export function duration(
  start: number,
  stop: number,
  includedEndDate: boolean
) {
  const startDateValue = parseTimeToDate(start);
  const startTimeValue = parseTime(start);

  const endDateValue = parseTimeToDate(stop);
  const endTimeValue = parseTime(stop);

  const unixTimestampStart = dayjs(
    `${startDateValue} ${startTimeValue}`,
    'YYYY-MM-DD hh:mm:ss'
  ).unix();

  let unixTimestampEnd = dayjs(
    `${endDateValue} ${endTimeValue}`,
    'YYYY-MM-DD hh:mm:ss'
  ).unix();

  let diff = dayjs
    .unix(unixTimestampEnd)
    .diff(dayjs.unix(unixTimestampStart), 'seconds');

  if (!includedEndDate && diff < 0) {
    unixTimestampEnd = dayjs(
      `${startDateValue} ${endTimeValue}`,
      'YYYY-MM-DD hh:mm:ss'
    ).unix();
  }

  diff = dayjs
    .unix(unixTimestampEnd)
    .diff(dayjs.unix(unixTimestampStart), 'seconds');

  if (diff < 0) {
    return '00:00:00';
  }

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

  if (stop && startDateValue !== '1970-01-01') {
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
