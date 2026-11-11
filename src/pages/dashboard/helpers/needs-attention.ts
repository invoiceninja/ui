/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Invoice } from '$app/common/interfaces/invoice';

dayjs.extend(utc);

export const NEEDS_ATTENTION_CARD = 'needs_your_attention';
export const NEEDS_ATTENTION_ROWS = 3;
export const NEEDS_ATTENTION_MAX_COLUMNS = 3;
export const NEEDS_ATTENTION_COLUMN_WIDTH = 300;

export interface AttentionFact {
  kind: 'reminded' | 'viewed' | 'not_opened';
  date?: Dayjs;
}

const toDay = (value: string | undefined | null) => {
  if (!value) {
    return null;
  }

  const day = dayjs(value);

  return day.isValid() ? day.startOf('day') : null;
};

const isDepositLate = (invoice: Invoice, today: Dayjs) => {
  const partialDueDate = toDay(invoice.partial_due_date);

  return Boolean(
    partialDueDate && invoice.partial > 0 && partialDueDate.isBefore(today)
  );
};

export const daysLate = (invoice: Invoice, today: Dayjs) => {
  const dueDate = toDay(invoice.due_date);

  if (dueDate && dueDate.isBefore(today)) {
    return today.diff(dueDate, 'day');
  }

  if (isDepositLate(invoice, today)) {
    return today.diff(toDay(invoice.partial_due_date), 'day');
  }

  return 0;
};

export const lateAmount = (invoice: Invoice, today: Dayjs) => {
  const dueDate = toDay(invoice.due_date);

  if (dueDate && dueDate.isBefore(today)) {
    return invoice.balance;
  }

  if (isDepositLate(invoice, today)) {
    return Math.min(invoice.partial, invoice.balance);
  }

  return invoice.balance;
};

export const attentionFact = (invoice: Invoice): AttentionFact | null => {
  const reminded = [
    invoice.reminder_last_sent,
    invoice.reminder1_sent,
    invoice.reminder2_sent,
    invoice.reminder3_sent,
  ]
    .map((value) => toDay(value))
    .reduce<Dayjs | null>(
      (latest, day) => (day && (!latest || day.isAfter(latest)) ? day : latest),
      null
    );

  const viewed = (invoice.invitations ?? [])
    .map(({ viewed_date }) =>
      viewed_date ? dayjs.utc(viewed_date).local().startOf('day') : null
    )
    .reduce<Dayjs | null>(
      (latest, day) =>
        day && day.isValid() && (!latest || day.isAfter(latest)) ? day : latest,
      null
    );

  if (reminded && (!viewed || !reminded.isBefore(viewed))) {
    return { kind: 'reminded', date: reminded };
  }

  if (viewed) {
    return { kind: 'viewed', date: viewed };
  }

  if ((invoice.invitations ?? []).some(({ sent_date }) => Boolean(sent_date))) {
    return { kind: 'not_opened' };
  }

  return null;
};

export const nextReminderTemplate = (invoice: Invoice) => {
  const sent = [
    invoice.reminder1_sent,
    invoice.reminder2_sent,
    invoice.reminder3_sent,
  ].filter(Boolean).length;

  if (sent === 0) {
    return 'email_template_reminder1';
  }

  if (sent === 1) {
    return 'email_template_reminder2';
  }

  return 'email_template_reminder3';
};

export const splitIntoColumns = <T>(rows: T[], columns: number) => {
  const used = Math.min(rows.length, columns);

  if (used <= 0) {
    return [];
  }

  const base = Math.floor(rows.length / used);
  const extra = rows.length % used;

  return Array.from({ length: used }, (_, index) => {
    const start = index * base + Math.min(index, extra);
    const size = base + (index < extra ? 1 : 0);

    return rows.slice(start, start + size);
  });
};
