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
  const numbers: number[][] = [];
  const parsed: number[][] = JSON.parse(log);

  if (parsed.length === 0) {
    numbers.push([0, 0]);

    return numbers;
  }

  const stringOfLogs = log.substring(1).slice(0, -1); // [1656923640,1656927240],[1658910857,1658946857],[1657032777,0]
  const arrayOfLogs = stringOfLogs.split('],['); // ['[1656923640,1656927240', '1658910857,1658946857', '1657032777,0]']

  console.log(arrayOfLogs);

  arrayOfLogs.forEach((record) => {
    const [startString, stopString] = record.split(','); // [1656923640,1656927240

    const startNumber = startString.startsWith('[')
      ? parseInt(startString.substring(1))
      : parseInt(startString);

    const stopNumber = stopString.endsWith(']')
      ? parseInt(stopString.slice(0, -1))
      : parseInt(stopString);

    numbers.push([startNumber, stopNumber]);
  });

  return numbers;
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
