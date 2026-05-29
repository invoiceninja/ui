/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CalendarProvider } from './user';

export interface CalendarEventAttendee {
  email: string;
  display_name?: string;
}

export interface CalendarEvent {
  provider: CalendarProvider;
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  all_day: boolean;
  html_link: string;
  attendees?: CalendarEventAttendee[];
}

export const calendarEventKey = (event: CalendarEvent): string =>
  `${event.provider}:${event.id}`;
