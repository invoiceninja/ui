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

export function generateMonthDateRange(startDate: Date, endDate: Date) {
  const start = dayjs.utc(startDate);
  const end = dayjs.utc(endDate);
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
