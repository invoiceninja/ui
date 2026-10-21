/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Frequency } from '$app/common/enums/frequency';
import dayjs from 'dayjs';

const INTERVALS: Record<string, [number, dayjs.ManipulateType]> = {
  [Frequency.Daily]: [1, 'day'],
  [Frequency.Weekly]: [1, 'week'],
  [Frequency.TwoWeeks]: [2, 'week'],
  [Frequency.FourWeeks]: [4, 'week'],
  [Frequency.Monthly]: [1, 'month'],
  [Frequency.TwoMonths]: [2, 'month'],
  [Frequency.ThreeMonths]: [3, 'month'],
  [Frequency.FourMonths]: [4, 'month'],
  [Frequency.SixMonths]: [6, 'month'],
  [Frequency.Annually]: [1, 'year'],
  [Frequency.TwoYears]: [2, 'year'],
  [Frequency.ThreeYears]: [3, 'year'],
};

const addInterval = (
  date: dayjs.Dayjs,
  [amount, unit]: [number, dayjs.ManipulateType]
): dayjs.Dayjs => {
  const next = date.add(amount, unit);

  if (unit === 'year' && date.date() === 29 && next.date() === 28) {
    return next.add(1, 'day');
  }

  return next;
};

export const upcomingDates = (
  start: string,
  frequencyId: string,
  remainingCycles: number,
  count: number
): string[] => {
  const interval = INTERVALS[frequencyId];

  if (!start || !interval) {
    return [];
  }

  const limit = remainingCycles >= 0 ? Math.min(count, remainingCycles) : count;
  const dates: string[] = [];

  let current = dayjs(start);

  for (let index = 0; index < limit; index += 1) {
    dates.push(current.format('YYYY-MM-DD'));
    current = addInterval(current, interval);
  }

  return dates;
};
