/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, test, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  formatBurnupXAxisTick,
  resolveBurnupMarkerDate,
  resolveProjectBurnupDateRange,
} from '$app/pages/projects/burnup/helpers';
import { ProjectBurnupSeriesRow } from '$app/common/interfaces/project-burnup';

function makeRow(
  overrides: Partial<ProjectBurnupSeriesRow> = {}
): ProjectBurnupSeriesRow {
  return {
    period: '',
    date: '',
    period_start: '',
    period_end: '',
    logged_hours: 0,
    billable_hours: 0,
    task_value: 0,
    invoiced_amount: 0,
    paid_to_date: 0,
    outstanding_amount: 0,
    expense_amount: 0,
    net_invoiced_amount: 0,
    net_paid_amount: 0,
    cumulative_logged_hours: 0,
    cumulative_billable_hours: 0,
    cumulative_task_value: 0,
    cumulative_invoiced_amount: 0,
    cumulative_paid_to_date: 0,
    cumulative_outstanding_amount: 0,
    cumulative_expense_amount: 0,
    cumulative_net_invoiced_amount: 0,
    cumulative_net_paid_amount: 0,
    budgeted_hours: 0,
    budgeted_amount: 0,
    ideal_hours: 0,
    ideal_amount: 0,
    task_log_count: 0,
    invoice_count: 0,
    expense_count: 0,
    ...overrides,
  };
}

function unix(value: string) {
  return dayjs(value).unix();
}

describe('resolveProjectBurnupDateRange', () => {
  test('spans from creation to the due date', () => {
    const range = resolveProjectBurnupDateRange({
      createdAt: unix('2026-07-01'),
      dueDate: '2026-08-08',
      today: '2026-07-27',
    });

    expect(range).toEqual({ start: '2026-07-01', end: '2026-08-08' });
  });

  test('extends the end to today when the project is overdue', () => {
    const range = resolveProjectBurnupDateRange({
      createdAt: unix('2026-07-01'),
      dueDate: '2026-07-10',
      today: '2026-07-27',
    });

    expect(range).toEqual({ start: '2026-07-01', end: '2026-07-27' });
  });

  test('falls back to today for the end when there is no due date', () => {
    const range = resolveProjectBurnupDateRange({
      createdAt: unix('2026-07-01'),
      dueDate: null,
      today: '2026-07-27',
    });

    expect(range).toEqual({ start: '2026-07-01', end: '2026-07-27' });
  });

  test('clamps the start to the end when creation is after the due date', () => {
    const range = resolveProjectBurnupDateRange({
      createdAt: unix('2026-09-01'),
      dueDate: '2026-08-08',
      today: '2026-07-27',
    });

    expect(range).toEqual({ start: '2026-08-08', end: '2026-08-08' });
  });
});

describe('resolveBurnupMarkerDate', () => {
  const series = [
    makeRow({
      date: '2026-07-01',
      period_start: '2026-07-01',
      period_end: '2026-07-07',
    }),
    makeRow({
      date: '2026-07-08',
      period_start: '2026-07-08',
      period_end: '2026-07-14',
    }),
  ];

  test('returns the exact row date when it matches', () => {
    expect(resolveBurnupMarkerDate('2026-07-08', series)).toEqual('2026-07-08');
  });

  test('returns the containing period date when there is no exact match', () => {
    expect(resolveBurnupMarkerDate('2026-07-03', series)).toEqual('2026-07-01');
  });

  test('returns undefined for a missing marker', () => {
    expect(resolveBurnupMarkerDate(null, series)).toBeUndefined();
  });
});

describe('formatBurnupXAxisTick', () => {
  const series = [makeRow({ date: '2026-07-01', period: 'Week 27' })];

  test('formats the date for daily buckets', () => {
    expect(
      formatBurnupXAxisTick('2026-07-01', series, 'daily', 'YYYY-MM-DD')
    ).toEqual('2026-07-01');
  });

  test('uses the period label for weekly buckets', () => {
    expect(
      formatBurnupXAxisTick('2026-07-01', series, 'weekly', 'YYYY-MM-DD')
    ).toEqual('Week 27');
  });

  test('returns the raw value when the row is unknown', () => {
    expect(
      formatBurnupXAxisTick('missing', series, 'daily', 'YYYY-MM-DD')
    ).toEqual('missing');
  });
});
