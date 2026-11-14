import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { createChartBucketResolver } from '../../../../src/pages/dashboard/helpers/helpers';

const labels = ['2026-01-01', '2026-01-08', '2026-01-15'];
const parse = (value: string) => dayjs(value);

describe('createChartBucketResolver', () => {
  it.each([
    'day',
    'week',
    'month',
  ] as const)('returns exact boundary indexes for %s charts', (chartSensitivity) => {
    const resolve = createChartBucketResolver(labels, parse, chartSensitivity);

    expect(labels.map(resolve)).toEqual([0, 1, 2]);
  });

  it('assigns dates between boundaries to the preceding day bucket', () => {
    const resolve = createChartBucketResolver(labels, parse, 'day');

    expect(resolve('2026-01-04')).toBe(0);
    expect(resolve('2026-01-12')).toBe(1);
  });

  it.each([
    'week',
    'month',
  ] as const)('assigns dates between boundaries to the following %s bucket', (chartSensitivity) => {
    const resolve = createChartBucketResolver(labels, parse, chartSensitivity);

    expect(resolve('2026-01-04')).toBe(1);
    expect(resolve('2026-01-12')).toBe(2);
  });

  it.each([
    'day',
    'week',
    'month',
  ] as const)('rejects dates outside the available %s chart range', (chartSensitivity) => {
    const resolve = createChartBucketResolver(labels, parse, chartSensitivity);

    expect(resolve('2025-12-31')).toBe(-1);
    expect(resolve('2026-01-16')).toBe(-1);
  });

  it('returns no match when there are no chart buckets', () => {
    const resolve = createChartBucketResolver([], parse, 'day');

    expect(resolve('2026-01-01')).toBe(-1);
  });
});
