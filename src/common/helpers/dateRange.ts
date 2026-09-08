import type { Dayjs } from 'dayjs';

export type DayjsRange = [Dayjs | null, Dayjs | null] | null;
export type SerializedDateRange = [string, string];

export function serializeDateRange(value: DayjsRange): SerializedDateRange {
  return [
    value?.[0]?.format('YYYY-MM-DD') ?? '',
    value?.[1]?.format('YYYY-MM-DD') ?? '',
  ];
}

export function serializeCompleteDateRange(
  value: DayjsRange
): SerializedDateRange | null {
  const [start, end] = serializeDateRange(value);

  return start && end ? [start, end] : null;
}

export function serializeOrderedDateRange(
  value: DayjsRange
): SerializedDateRange | null {
  if (!value?.[0] || !value[1]) {
    return null;
  }

  const [start, end] = value[0].isAfter(value[1])
    ? [value[1], value[0]]
    : [value[0], value[1]];

  return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')];
}
