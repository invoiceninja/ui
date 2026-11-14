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
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function generateMonthDateRange(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  const dates = [];

  let currentDate = start.clone();

  if (
    !start.isSame(start.startOf('month'), 'day') &&
    !start.isSame(start.endOf('month'), 'day')
  ) {
    dates.push(start.toDate());
  }

  while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
    if (
      currentDate.isSame(start.startOf('month'), 'day') &&
      !currentDate.isSame(start.endOf('month'), 'day')
    ) {
      dates.push(start.toDate());
    }

    const endOfMonth = currentDate.endOf('month');

    if (endOfMonth.isSame(end, 'day') || endOfMonth.isBefore(end, 'day')) {
      dates.push(endOfMonth.toDate());
    }

    currentDate = currentDate.add(1, 'month');
  }

  if (!end.isSame(end.endOf('month'), 'day')) {
    dates.push(end.toDate());
  }

  return dates;
}

export function ensureUniqueDates(dates: Date[], end: dayjs.Dayjs): Date[] {
  let currentDates = dates;

  const lengthOfDates = currentDates.length;

  if (dayjs.utc(currentDates[lengthOfDates - 1]).isAfter(end)) {
    currentDates[lengthOfDates - 1] = end.toDate();
  }

  const seenDates = new Set<string>();

  currentDates = currentDates.reduce((uniqueDates, currentDate) => {
    const currentDateString = dayjs.utc(currentDate).format('YYYY-MM-DD');

    if (!seenDates.has(currentDateString)) {
      seenDates.add(currentDateString);
      uniqueDates.push(currentDate);
    }

    return uniqueDates;
  }, [] as Date[]);

  return currentDates;
}

export const createChartBucketResolver = (
  labels: string[],
  parse: (value: string) => dayjs.Dayjs,
  chartSensitivity: 'day' | 'week' | 'month'
) => {
  const firstIndexByLabel = new Map<string, number>();

  labels.forEach((label, index) => {
    if (!firstIndexByLabel.has(label)) {
      firstIndexByLabel.set(label, index);
    }
  });

  const boundaries = labels.map((label) => parse(label).valueOf());

  const finiteIndexes = boundaries.flatMap((boundary, index) =>
    Number.isFinite(boundary) ? [index] : []
  );

  const areFiniteBoundariesAscending = finiteIndexes.every(
    (boundaryIndex, position) =>
      position === 0 ||
      boundaries[finiteIndexes[position - 1]] < boundaries[boundaryIndex]
  );

  const findRangeIndex = (time: number) => {
    if (!areFiniteBoundariesAscending) {
      return boundaries.findIndex(
        (boundary, index) =>
          index < boundaries.length - 1 &&
          boundary < time &&
          time < boundaries[index + 1]
      );
    }

    let low = 0;
    let high = finiteIndexes.length - 1;
    let candidate = -1;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);

      if (boundaries[finiteIndexes[middle]] < time) {
        candidate = finiteIndexes[middle];
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    return candidate >= 0 &&
      candidate < boundaries.length - 1 &&
      time < boundaries[candidate + 1]
      ? candidate
      : -1;
  };

  return (label: string) => {
    const exactIndex = firstIndexByLabel.get(label) ?? -1;
    const rangeIndex = findRangeIndex(parse(label).valueOf());

    if (exactIndex >= 0 && (rangeIndex < 0 || exactIndex <= rangeIndex)) {
      return exactIndex;
    }

    if (rangeIndex < 0) {
      return -1;
    }

    return chartSensitivity !== 'day' ? rangeIndex + 1 : rangeIndex;
  };
};
