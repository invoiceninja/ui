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
import { computeBurnUp } from '$app/pages/projects/show/common/helpers/burn-up';
import { Project } from '$app/common/interfaces/project';
import { Task } from '$app/common/interfaces/task';
import { User } from '$app/common/interfaces/user';

const HOUR = 3600;

function unix(value: string): number {
  return dayjs(value).unix();
}

function oneHourPerDay(days: string[]): string {
  return JSON.stringify(
    days.map((day) => {
      const start = unix(`${day}T09:00:00`);

      return [start, start + HOUR, '', true];
    })
  );
}

const baseUser: User = {
  id: '1',
  first_name: 'Jim',
  last_name: 'Bob',
  email: 'jim@example.com',
  phone: '1234567890',
  has_password: true,
  oauth_provider_id: '',
  custom_value1: '',
  custom_value2: '',
  custom_value3: '',
  custom_value4: '',
  email_verified_at: 0,
  google_2fa_secret: false,
  is_deleted: false,
  last_confirmed_email_address: '',
  last_login: 0,
  oauth_user_token: '',
  signature: '',
  verified_phone_number: false,
  created_at: 0,
  updated_at: 0,
  archived_at: 0,
  language_id: '1',
  user_logged_in_notification: true,
};

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    user_id: '1',
    assigned_user_id: '1',
    client_id: '1',
    invoice_id: '',
    project_id: 'project-1',
    status_id: '1',
    status_sort_order: 0,
    custom_value1: '',
    custom_value2: '',
    custom_value3: '',
    custom_value4: '',
    duration: 0,
    description: '',
    is_running: false,
    time_log: '[]',
    number: '',
    rate: 0,
    is_date_based: false,
    status_order: 0,
    is_deleted: false,
    archived_at: 0,
    created_at: 0,
    updated_at: 0,
    documents: [],
    date: '',
    calculated_start_date: '',
    user: baseUser,
    assigned_user: baseUser,
    ...overrides,
  };
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    user_id: '1',
    assigned_user_id: '1',
    client_id: '1',
    name: 'Website Redesign',
    number: 'PRJ-1',
    created_at: unix('2026-01-01'),
    updated_at: 0,
    archived_at: 0,
    is_deleted: false,
    task_rate: 0,
    due_date: '',
    private_notes: '',
    public_notes: '',
    budgeted_hours: 0,
    custom_value1: '',
    custom_value2: '',
    custom_value3: '',
    custom_value4: '',
    color: '',
    documents: [],
    current_hours: 0,
    tasks: [],
    ...overrides,
  };
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

    expect(data.hasTasks).toEqual(true);
    expect(data.hasScope).toEqual(true);
    expect(data.granularity).toEqual('day');

    expect(data.summary.scopeHours).toEqual(10);
    expect(data.summary.loggedHours).toEqual(5);
    expect(data.summary.percentComplete).toEqual(50);
    expect(data.summary.remainingHours).toEqual(5);
    expect(data.summary.targetPercent).toEqual(50);
    expect(data.summary.status).toEqual('on_track');

    expect(data.todayKey).toEqual('2026-01-06');
    expect(data.dueDateKey).toEqual('2026-01-11');

    const today = data.series.find((point) => point.date === '2026-01-06');
    expect(today?.completed).toEqual(50);

    const future = data.series.find((point) => point.date === '2026-01-09');
    expect(future?.completed).toBeNull();

    const end = data.series.find((point) => point.date === '2026-01-11');
    expect(end?.target).toEqual(100);
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

    expect(data.summary.percentComplete).toEqual(80);
    expect(data.summary.status).toEqual('ahead_of_schedule');
  });

  test('flags a behind-schedule project', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 10,
      tasks: [makeTask({ time_log: oneHourPerDay(['2026-01-01']) })],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.summary.percentComplete).toEqual(10);
    expect(data.summary.status).toEqual('behind_schedule');
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

    expect(data.summary.percentComplete).toEqual(30);
    expect(data.summary.status).toEqual('overdue');
    expect(data.dueDateKey).toEqual('2026-01-05');
    expect(data.series[data.series.length - 1].date).toEqual('2026-01-10');
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

    expect(data.summary.percentComplete).toEqual(125);
    expect(data.summary.status).toEqual('over_budget');
    expect(data.summary.remainingHours).toEqual(0);
  });

  test('reports missing scope when budgeted hours are not set', () => {
    const project = makeProject({
      created_at: unix('2026-01-01'),
      due_date: '2026-01-11',
      budgeted_hours: 0,
      tasks: [makeTask({ time_log: oneHourPerDay(['2026-01-02']) })],
    });

    const data = computeBurnUp(project, { now: dayjs('2026-01-06') });

    expect(data.hasTasks).toEqual(true);
    expect(data.hasScope).toEqual(false);
    expect(data.summary.status).toEqual('not_started');
    expect(data.series.every((point) => point.completed === null)).toEqual(
      true
    );
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

    expect(data.summary.activeTaskCount).toEqual(1);
    expect(data.summary.loggedHours).toEqual(1);
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

    expect(data.summary.runningTaskCount).toEqual(1);
    expect(data.summary.loggedHours).toEqual(2);
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

    expect(data.summary.invoicedTaskCount).toEqual(1);
    expect(data.summary.projectedCompletion).toEqual('2026-01-11');
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

    expect(weekly.granularity).toEqual('week');

    const monthly = computeBurnUp(
      makeProject({
        created_at: unix('2026-01-01'),
        due_date: '2026-12-01',
        budgeted_hours: 200,
        tasks: [makeTask({ time_log: oneHourPerDay(['2026-02-05']) })],
      }),
      { now: dayjs('2026-06-01') }
    );

    expect(monthly.granularity).toEqual('month');
  });
});
