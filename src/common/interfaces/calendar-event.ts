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
