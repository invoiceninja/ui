/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Frequency } from '$app/common/enums/frequency';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import dayjs from 'dayjs';
import { toDateInput, today } from './dates';
import { isDraft } from './status';

const INTERVALS: Record<string, [number, dayjs.ManipulateType]> = {
  [Frequency.Daily]: [1, 'day'],
  [Frequency.Weekly]: [1, 'week'],
  [Frequency.TwoWeeks]: [2, 'week'],
  [Frequency.FourWeeks]: [4, 'week'],
  [Frequency.Monthly]: [1, 'month'],
  [Frequency.TwoMonths]: [2, 'month'],
  [Frequency.ThreeMonths]: [3, 'month'],
  [Frequency.FourMonths]: [4, 'month'],
  [Frequency.SixMonths]: [6, 'month'],
  [Frequency.Annually]: [1, 'year'],
  [Frequency.TwoYears]: [2, 'year'],
  [Frequency.ThreeYears]: [3, 'year'],
};

const addInterval = (
  date: dayjs.Dayjs,
  [amount, unit]: [number, dayjs.ManipulateType]
): dayjs.Dayjs => {
  const next = date.add(amount, unit);

  if (unit === 'year' && date.date() === 29 && next.date() === 28) {
    return next.add(1, 'day');
  }

  return next;
};

export const upcomingDates = (
  start: string,
  frequencyId: string,
  remainingCycles: number,
  count: number
): string[] => {
  const interval = INTERVALS[frequencyId];

  if (!start || !interval) {
    return [];
  }

  const limit = remainingCycles >= 0 ? Math.min(count, remainingCycles) : count;
  const dates: string[] = [];

  let current = dayjs(start);

  for (let index = 0; index < limit; index += 1) {
    dates.push(current.format('YYYY-MM-DD'));
    current = addInterval(current, interval);
  }

  return dates;
};

export const sendsRightAway = (
  recurringInvoice: RecurringInvoice | undefined,
  startLater: boolean
): boolean => {
  return isDraft(recurringInvoice) && !startLater;
};

export const firstSendDate = (
  recurringInvoice: RecurringInvoice | undefined,
  startLater: boolean
): string => {
  return sendsRightAway(recurringInvoice, startLater)
    ? today()
    : toDateInput(recurringInvoice?.next_send_date);
};

export const lastDate = (
  start: string,
  frequencyId: string,
  remainingCycles: number
): string | null => {
  if (remainingCycles < 1) {
    return null;
  }

  const dates = upcomingDates(
    start,
    frequencyId,
    remainingCycles,
    remainingCycles
  );

  return dates.length ? dates[dates.length - 1] : null;
};

export const dueDate = (
  sendDate: string,
  dueDateDays: string | undefined,
  terms: string | number | null | undefined
): string | null => {
  const sent = dayjs(sendDate);

  if (dueDateDays === 'on_receipt') {
    return sent.format('YYYY-MM-DD');
  }

  const day = parseInt(String(dueDateDays ?? ''), 10);

  if (!(day >= 1 && day <= 31)) {
    if (terms === '' || terms === null || terms === undefined) {
      return null;
    }

    return sent
      .add(parseInt(String(terms), 10) || 0, 'day')
      .format('YYYY-MM-DD');
  }

  let due = sent.date(Math.min(day, sent.daysInMonth()));

  if (!due.isAfter(sent, 'day')) {
    due = due.add(1, 'month');
  }

  if (day === 31) {
    due = due.endOf('month');
  }

  return due.format('YYYY-MM-DD');
};
