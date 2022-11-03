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

export function parseTimeLog(log: string) {
  if (log === '' || log === '[]') {
    return [];
  }

  const numbers: number[][] = [];
  const parsed: number[][] = JSON.parse(log);

  if (parsed.length === 0) {
    numbers.push([0, 0]);

    return numbers;
  }

  return parsed;
}

export function calculateTime(log: string) {
  const times = parseTimeLog(log);

  let seconds = 0;

  times.map(([start, stop]) => {
    const startTime = start ? dayjs.unix(start) : dayjs();
    const stopTime = stop ? dayjs.unix(stop) : dayjs();

    seconds += stopTime.diff(startTime, 'seconds');
  });

  return new Date(seconds * 1000).toISOString().slice(11, 19);
}

