/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date as formatDate } from '$app/common/helpers';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useMemo } from 'react';

type DateInput = string | Date | Dayjs;
type TimeInput = number | string | Date | Dayjs;

const toDateKey = (value: DateInput) => {
  if (dayjs.isDayjs(value)) {
    return value.format('YYYY-MM-DD');
  }

  if (value instanceof Date) {
    return dayjs(value).format('YYYY-MM-DD');
  }

  return value;
};

export function useTaskDateDisplay() {
  const { dateFormat } = useCurrentCompanyDateFormats();
  const { timeFormat } = useCompanyTimeFormat();

  const compactTimeFormat = useMemo(
    () => timeFormat.replace(':ss', ''),
    [timeFormat]
  );

  const displayDate = useCallback(
    (value: DateInput) => formatDate(toDateKey(value), dateFormat),
    [dateFormat]
  );

  const displayDateRange = useCallback(
    (start: DateInput, end: DateInput) =>
      `${displayDate(start)} - ${displayDate(end)}`,
    [displayDate]
  );

  const displayTime = useCallback(
    (value: TimeInput) => {
      if (typeof value === 'number') {
        return dayjs.unix(value).format(compactTimeFormat);
      }

      return dayjs(value).format(compactTimeFormat);
    },
    [compactTimeFormat]
  );

  const displayWeekday = useCallback(
    (value: Dayjs, format: 'short' | 'long' = 'short') =>
      value.format(format === 'long' ? 'dddd' : 'ddd'),
    []
  );

  return {
    displayDate,
    displayDateRange,
    displayTime,
    displayWeekday,
  };
}
