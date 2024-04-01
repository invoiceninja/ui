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

export function useGenerateWeekDateRange() {
  return (startDate: Date, endDate: Date) => {
    const start = dayjs.utc(startDate);
    const end = dayjs.utc(endDate);
    const dates = [];

    let currentDate = start.clone();

    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
      if (currentDate.isSame(start, 'day')) {
        dates.push(start.toDate());
      }

      dates.push(currentDate.endOf('week').toDate());
      currentDate = currentDate.add(1, 'week');
    }

    const lengthOfDates = dates.length;

    if (dayjs.utc(dates[lengthOfDates - 1]).isAfter(end)) {
      dates[lengthOfDates - 1] = end.toDate();
    }

    return dates;
  };
}
