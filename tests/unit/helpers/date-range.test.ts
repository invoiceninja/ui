import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import {
  serializeCompleteDateRange,
  serializeDateRange,
  serializeOrderedDateRange,
} from '../../../src/common/helpers/dateRange';

const start = dayjs('2026-08-18');
const end = dayjs('2026-09-25');

describe('date range serialization', () => {
  it('serializes Dayjs values to canonical dates', () => {
    expect(serializeDateRange([start, end])).toEqual([
      '2026-08-18',
      '2026-09-25',
    ]);
  });

  it('preserves partial and cleared range state', () => {
    expect(serializeDateRange([start, null])).toEqual(['2026-08-18', '']);
    expect(serializeDateRange(null)).toEqual(['', '']);
    expect(serializeCompleteDateRange([start, null])).toBeNull();
    expect(serializeCompleteDateRange(null)).toBeNull();
  });

  it('normalizes reverse ranges', () => {
    expect(serializeOrderedDateRange([end, start])).toEqual([
      '2026-08-18',
      '2026-09-25',
    ]);
  });
});
