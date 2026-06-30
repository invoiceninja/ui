/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type {
  ProjectBurnupBucketType,
  ProjectBurnupSeriesRow,
} from '$app/common/interfaces/project-burnup';
import dayjs from 'dayjs';

export function resolveBurnupMarkerDate(
  markerDate: string | null | undefined,
  series: ProjectBurnupSeriesRow[]
) {
  if (!markerDate) {
    return undefined;
  }

  const exactRow = series.find((row) => row.date === markerDate);

  if (exactRow) {
    return exactRow.date;
  }

  const dueDate = dayjs(markerDate);

  if (!dueDate.isValid()) {
    return undefined;
  }

  return series.find((row) => {
    const periodStart = dayjs(row.period_start || row.date);
    const periodEnd = dayjs(row.period_end || row.date);

    if (!periodStart.isValid() || !periodEnd.isValid()) {
      return false;
    }

    return (
      (dueDate.isSame(periodStart, 'day') ||
        dueDate.isAfter(periodStart, 'day')) &&
      (dueDate.isSame(periodEnd, 'day') || dueDate.isBefore(periodEnd, 'day'))
    );
  })?.date;
}

export function formatBurnupXAxisTick(
  value: string,
  series: ProjectBurnupSeriesRow[],
  bucketType: ProjectBurnupBucketType,
  dateFormat: string
) {
  const row = series.find((row) => row.date === value);

  if (!row) {
    return value;
  }

  if (bucketType === 'weekly' || bucketType === 'monthly') {
    return row.period || row.date;
  }

  return dayjs(row.date).format(dateFormat);
}
