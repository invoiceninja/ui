/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import type { CalendarProvider } from './user';

export interface CalendarEvent {
  id: string;
  provider: CalendarProvider;
  provider_event_id: string;
  calendar_id: string;
  calendar_name?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  all_day: boolean;
  status?: string;
  url?: string;
  updated?: string;
}

// Stable cross-source key for de-dup against task.meta.calendar_event_id.
// We prefer the fully qualified backend id (which already encodes provider +
// calendar + event), falling back to a constructed key if a backend ever
// returns only the raw provider_event_id.
export const calendarEventKey = (event: CalendarEvent): string =>
  event.id ||
  `${event.provider}:${event.calendar_id}:${event.provider_event_id}`;

const CALENDAR_EVENT_DATE_TIME =
  /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2})?))?/;

export const calendarEventDateKey = (
  eventOrStart: CalendarEvent | string
): string => {
  // Timed events are a UTC instant but are rendered — and logged onto tasks —
  // in the browser's local timezone. Their calendar day must therefore be
  // derived AFTER converting to local time, otherwise an event late in the UTC
  // day lands on the wrong day for users with a positive offset (e.g.
  // 2026-05-27T17:00Z is 2026-05-28 03:00 at UTC+10), splitting the day from
  // the clock time displayed alongside it.
  if (typeof eventOrStart !== 'string' && !eventOrStart.all_day) {
    return dayjs(eventOrStart.start).format('YYYY-MM-DD');
  }

  // All-day events (and bare strings) carry a floating wall-clock date that
  // must NOT be shifted by timezone — extract the date portion verbatim.
  const value =
    typeof eventOrStart === 'string' ? eventOrStart : eventOrStart.start;
  const match = value.match(CALENDAR_EVENT_DATE_TIME);

  return match?.[1] || value;
};
