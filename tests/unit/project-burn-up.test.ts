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
import { computeBurnUp } from '$app/pages/projects/show/components/burn-up';
import { Project } from '$app/common/interfaces/project';
import { Task } from '$app/common/interfaces/task';

const HOUR = 3600;

function unix(value: string) {
  return dayjs(value).unix();
}

function oneHourPerDay(days: string[]) {
  return JSON.stringify(
    days.map((day) => {
      const start = unix(`${day}T09:00:00`);
      return [start, start + HOUR, '', true];
    })
  );
}

function makeTask(overrides: Partial<Task>): Task {
  return {
    time_log: '[]',
    archived_at: 0,
    is_deleted: false,
    invoice_id: '',
    ...overrides,
  } as unknown as Task;
}

function makeProject(overrides: Partial<Project>): Project {
  return {
    created_at: unix('2026-01-01'),
    due_date: '',
    budgeted_hours: 0,
    tasks: [],
    ...overrides,
  } as unknown as Project;
}

describe('computeBurnUp', () => {
  test('derives cumulative progress from task time logs against the budget', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 10,
      tasks: [
        makeTask({
          time_log: oneHourPerDay([
            '2026-01-01',
            '2026-01-02',
            '2026-01-03',
            '2026-01-04',
            '2026-01-05',
          ]),
        }),
      ],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.hasTasks).toBe(true);
    expect(data.hasScope).toBe(true);
    expect(data.granularity).toBe('day');

    expect(data.summary.scopeHours).toBe(10);
    expect(data.summary.loggedHours).toBeCloseTo(5, 5);
    expect(data.summary.percentComplete).toBeCloseTo(50, 5);
    expect(data.summary.remainingHours).toBeCloseTo(5, 5);
    expect(data.summary.targetPercent).toBeCloseTo(50, 5);
    expect(data.summary.status).toBe('on_track');

    expect(data.todayKey).toBe('2026-01-06');
    expect(data.dueDateKey).toBe('2026-01-11');

    const today = data.series.find((point) => point.date === '2026-01-06');
    expect(today?.completed).toBeCloseTo(50, 5);

    const future = data.series.find((point) => point.date === '2026-01-09');
    expect(future?.completed).toBeNull();

    const end = data.series.find((point) => point.date === '2026-01-11');
    expect(end?.target).toBeCloseTo(100, 5);
  });

  test('flags a project that is ahead of the ideal pace', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 10,
      tasks: [
        makeTask({
          time_log: oneHourPerDay([
            '2026-01-01',
            '2026-01-02',
            '2026-01-03',
            '2026-01-04',
            '2026-01-05',
            '2026-01-06',
            '2026-01-07',
            '2026-01-08',
          ]),
        }),
      ],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.summary.percentComplete).toBeCloseTo(80, 5);
    expect(data.summary.status).toBe('ahead_of_schedule');
  });

  test('flags a behind-schedule project', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 10,
      tasks: [makeTask({ time_log: oneHourPerDay(['2026-01-01']) })],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.summary.percentComplete).toBeCloseTo(10, 5);
    expect(data.summary.status).toBe('behind_schedule');
  });

  test('flags an overdue project', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-05',
      budgeted_hours: 10,
      tasks: [
        makeTask({
          time_log: oneHourPerDay(['2026-01-01', '2026-01-02', '2026-01-03']),
        }),
      ],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-10') });

    expect(data.summary.percentComplete).toBeCloseTo(30, 5);
    expect(data.summary.status).toBe('overdue');
    expect(data.dueDateKey).toBe('2026-01-05');
    expect(data.series[data.series.length - 1].date).toBe('2026-01-10');
  });

  test('flags an over-budget project', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 4,
      tasks: [
        makeTask({
          time_log: oneHourPerDay([
            '2026-01-01',
            '2026-01-02',
            '2026-01-03',
            '2026-01-04',
            '2026-01-05',
          ]),
        }),
      ],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.summary.percentComplete).toBeCloseTo(125, 5);
    expect(data.summary.status).toBe('over_budget');
    expect(data.summary.remainingHours).toBe(0);
  });

  test('reports missing scope when budgeted hours are not set', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 0,
      tasks: [makeTask({ time_log: oneHourPerDay(['2026-01-02']) })],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.hasTasks).toBe(true);
    expect(data.hasScope).toBe(false);
    expect(data.summary.status).toBe('not_started');
    expect(data.series.every((point) => point.completed === null)).toBe(true);
  });

  test('excludes archived and deleted tasks from the computation', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 10,
      tasks: [
        makeTask({ time_log: oneHourPerDay(['2026-01-02']) }),
        makeTask({
          time_log: oneHourPerDay(['2026-01-03', '2026-01-04']),
          archived_at: unix('2026-01-05'),
        }),
        makeTask({
          time_log: oneHourPerDay(['2026-01-03', '2026-01-04']),
          is_deleted: true,
        }),
      ],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.summary.activeTaskCount).toBe(1);
    expect(data.summary.loggedHours).toBeCloseTo(1, 5);
  });

  test('counts a running time log up to now and marks the task as running', () => {
    const runningStart = dayjs('2026-01-06').subtract(2, 'hour').unix();

    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 10,
      tasks: [
        makeTask({
          time_log: JSON.stringify([[runningStart, 0, '', true]]),
        }),
      ],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06T00:00:00') });

    expect(data.summary.runningTaskCount).toBe(1);
    expect(data.summary.loggedHours).toBeGreaterThan(0);
  });

  test('counts invoiced tasks and produces a projected completion date', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 10,
      tasks: [
        makeTask({
          time_log: oneHourPerDay([
            '2026-01-01',
            '2026-01-02',
            '2026-01-03',
            '2026-01-04',
            '2026-01-05',
          ]),
          invoice_id: '123',
        }),
      ],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.summary.invoicedTaskCount).toBe(1);
    expect(data.summary.projectedCompletion).toBe('2026-01-11');
  });

  test('switches to weekly and monthly buckets for longer timelines', () => {
    const weekly = computeBurnUp(
      makeProject({
        created_at: unix('2026-01-01'),
        due_date: '2026-03-01',
        budgeted_hours: 40,
        tasks: [makeTask({ time_log: oneHourPerDay(['2026-01-05']) })],
      }),
      { now: dayjs('2026-01-20') }
    );

    expect(weekly.granularity).toBe('week');

    const monthly = computeBurnUp(
      makeProject({
        created_at: unix('2026-01-01'),
        due_date: '2026-12-01',
        budgeted_hours: 200,
        tasks: [makeTask({ time_log: oneHourPerDay(['2026-02-05']) })],
      }),
      { now: dayjs('2026-06-01') }
    );

    expect(monthly.granularity).toBe('month');
  });
});
